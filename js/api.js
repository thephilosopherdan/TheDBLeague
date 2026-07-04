// ═════════════════════════════════════════════════════════════════════════
//  THE D.B. LEAGUE — DATA LAYER
//  Sleeper API (live league data) + FantasyCalc (dynasty market values)
//  Single league, one history chain. Browser-side, no keys, localStorage cache.
// ═════════════════════════════════════════════════════════════════════════

const API = (() => {

    const SLEEPER = 'https://api.sleeper.app/v1';

    // ── cache versioning: bump CACHE_V on breaking format changes ──────────
    const CACHE_V = 'v1';
    try {
        if (localStorage.getItem('db_cache_v') !== CACHE_V) {
            Object.keys(localStorage)
                .filter(k => k.startsWith('c_') || k.startsWith('hm_') || ['fc_values_v1', 'nfl_players_v2'].includes(k))
                .forEach(k => localStorage.removeItem(k));
            localStorage.setItem('db_cache_v', CACHE_V);
        }
    } catch (e) { /* private mode etc. */ }

    async function cachedJSON(url, ttlMs, cacheKey) {
        const key = cacheKey || ('c_' + url);
        if (ttlMs > 0) {
            try {
                const hit = localStorage.getItem(key);
                if (hit) {
                    const { t, d } = JSON.parse(hit);
                    if (Date.now() - t < ttlMs) return d;
                }
            } catch (e) { /* corrupted cache — ignore */ }
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${url}`);
        const data = await res.json();
        if (ttlMs > 0) {
            try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); }
            catch (e) { /* quota — skip caching */ }
        }
        return data;
    }

    const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;

    const nflState = () => cachedJSON(`${SLEEPER}/state/nfl`, 10 * MIN);

    let _playerMap = null;
    async function playerMap() {
        if (_playerMap) return _playerMap;
        _playerMap = await cachedJSON(`${SLEEPER}/players/nfl`, DAY, 'nfl_players_v2');
        return _playerMap;
    }

    const league   = id => cachedJSON(`${SLEEPER}/league/${id}`, 10 * MIN);
    const users    = id => cachedJSON(`${SLEEPER}/league/${id}/users`, 10 * MIN);
    const rosters  = id => cachedJSON(`${SLEEPER}/league/${id}/rosters`, 5 * MIN);
    const matchups = (id, wk) => cachedJSON(`${SLEEPER}/league/${id}/matchups/${wk}`, 5 * MIN);
    const tradedPicks = id => cachedJSON(`${SLEEPER}/league/${id}/traded_picks`, HOUR);
    const winnersBracket = id => cachedJSON(`${SLEEPER}/league/${id}/winners_bracket`, HOUR);

    function transactionsWeek(id, wk, currentWeek) {
        const ttl = wk < currentWeek ? 12 * HOUR : 5 * MIN;
        return cachedJSON(`${SLEEPER}/league/${id}/transactions/${wk}`, ttl).catch(() => []);
    }
    async function allTransactions(id, currentWeek) {
        const weeks = [];
        for (let w = 1; w <= Math.max(currentWeek, 1); w++) weeks.push(w);
        const results = await Promise.all(weeks.map(w => transactionsWeek(id, w, currentWeek)));
        return results.flat().filter(t => t && t.status === 'complete');
    }
    async function allMatchups(id, throughWeek) {
        const weeks = [];
        for (let w = 1; w <= throughWeek; w++) weeks.push(w);
        return Promise.all(weeks.map(w => matchups(id, w).catch(() => [])));
    }

    const trending = type => cachedJSON(`${SLEEPER}/players/nfl/trending/${type}?lookback_hours=48&limit=25`, 30 * MIN);

    let _fc = null;
    async function fcValues() {
        if (_fc) return _fc;
        const p = FC_PARAMS;
        const url = `https://api.fantasycalc.com/values/current?isDynasty=${p.isDynasty}&numQbs=${p.numQbs}&numTeams=${p.numTeams}&ppr=${p.ppr}`;
        const list = await cachedJSON(url, 6 * HOUR, 'fc_values_v1');
        const bySleeper = {}, picks = [];
        list.forEach(e => {
            if (e.player.sleeperId) bySleeper[e.player.sleeperId] = e;
            else if (/^\d{4}/.test(e.player.name)) picks.push(e);
        });
        _fc = { list, bySleeper, picks };
        return _fc;
    }

    // team logo: local override first, then Sleeper per-league avatar, then account avatar
    const logoFor = u => (u && LOGO_OVERRIDES[u.user_id]) || u?.metadata?.avatar || u?.avatar || null;

    // ── assembled league context ────────────────────────────────────────────
    let _ctx = null;
    async function leagueContext() {
        if (_ctx && Date.now() - _ctx.t < 2 * MIN) return _ctx.ctx;
        const id = LEAGUE_ID;
        const [state, lg, us, ro] = await Promise.all([nflState(), league(id), users(id), rosters(id)]);

        const nflLive = ['regular', 'post'].includes(state.season_type);
        const inSeason = nflLive && (lg.status === 'in_season' || lg.status === 'post_season');
        const currentWeek = inSeason ? Math.max(1, Math.min(state.week || lg.settings.leg || 1, 18)) : 1;
        const completedWeeks = inSeason ? Math.max(0, currentWeek - 1) : 0;
        const weeklyMatchups = inSeason ? await allMatchups(id, currentWeek) : [];

        const teams = ro.map(r => {
            const u = us.find(x => x.user_id === r.owner_id);
            const name = u?.metadata?.team_name || u?.display_name || `Team ${r.roster_id}`;
            const scores = [];
            for (let w = 0; w < completedWeeks; w++) {
                const m = (weeklyMatchups[w] || []).find(m => m.roster_id === r.roster_id);
                if (m && m.points > 0) scores.push(m.points);
            }
            return {
                rosterId: r.roster_id, user: u, roster: r, name,
                display: u?.display_name || 'Unknown',
                avatar: logoFor(u),
                division: r.settings.division || null,
                wins: r.settings.wins, losses: r.settings.losses, ties: r.settings.ties || 0,
                fpts: r.settings.fpts + (r.settings.fpts_decimal || 0) / 100,
                fptsAgainst: (r.settings.fpts_against || 0) + (r.settings.fpts_against_decimal || 0) / 100,
                players: r.players || [], starters: r.starters || [],
                weeklyScores: scores
            };
        });

        teams.sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);
        teams.forEach((t, i) => t.standing = i + 1);

        const ctx = { id, league: lg, users: us, rosters: ro, teams, state,
                      inSeason, currentWeek, completedWeeks, weeklyMatchups };
        _ctx = { t: Date.now(), ctx };
        return ctx;
    }

    // ── season history chain (walks previous_league_id) ────────────────────
    // Per-season owner attribution: never trust Sleeper's cumulative slot stats.
    async function leagueHistory() {
        const seasons = [];
        let id = LEAGUE_ID;
        for (let hop = 0; hop < 15 && id; hop++) {
            const lg = await cachedJSON(`${SLEEPER}/league/${id}`, hop === 0 ? 10 * MIN : 30 * DAY);
            const done = lg.status === 'complete';
            const ttl = done ? 30 * DAY : 10 * MIN;
            const [us, ro] = await Promise.all([
                cachedJSON(`${SLEEPER}/league/${id}/users`, ttl),
                cachedJSON(`${SLEEPER}/league/${id}/rosters`, ttl)
            ]);
            const teams = ro.map(r => {
                const u = us.find(x => x.user_id === r.owner_id);
                return {
                    ownerId: r.owner_id,
                    display: u?.display_name || 'Unknown',
                    avatar: logoFor(u),
                    teamName: u?.metadata?.team_name || u?.display_name || `Roster ${r.roster_id}`,
                    rosterId: r.roster_id, division: r.settings.division || null,
                    wins: r.settings.wins || 0, losses: r.settings.losses || 0, ties: r.settings.ties || 0,
                    fpts: (r.settings.fpts || 0) + (r.settings.fpts_decimal || 0) / 100,
                    weekLog: r.metadata?.record || ''
                };
            });
            teams.sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);
            teams.forEach((t, i) => t.standing = i + 1);
            const bracket = done
                ? await cachedJSON(`${SLEEPER}/league/${id}/winners_bracket`, 30 * DAY).catch(() => null)
                : null;
            const loserBracket = done
                ? await cachedJSON(`${SLEEPER}/league/${id}/losers_bracket`, 30 * DAY).catch(() => null)
                : null;
            seasons.push({ season: +lg.season, leagueId: id, complete: done, teams, bracket, loserBracket });
            id = lg.previous_league_id;
        }
        return seasons; // newest first
    }

    async function seasonMatchups(id) {
        const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
        return Promise.all(weeks.map(w =>
            cachedJSON(`${SLEEPER}/league/${id}/matchups/${w}`, 30 * DAY, `hm_${id}_${w}`).catch(() => [])));
    }

    // ── commissioner's Google Sheet — live dynasty rankings ─────────────────
    // Rows are keyed by OWNER FIRST NAME (sheetName in DYNASTY_RANKS).
    const SHEET_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

    function parseCSV(text) {
        const rows = []; let row = [], cur = '', q = false;
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
            else if (c === '"') q = true;
            else if (c === ',') { row.push(cur); cur = ''; }
            else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
            else if (c !== '\r') cur += c;
        }
        if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
        return rows;
    }

    // header fragments → keys. Order matters: more specific fragments first.
    const SHEET_COLS = [
        ['score',           'Dynasty Ranking Score'],
        ['winPctCol',       'Win %'],
        ['b2bLast',         'Back to Back Last Place'],
        ['b2b',             'Back to Back Championship'],
        ['champ',           'Championships'],
        ['secondPlace',     'Second Place'],
        ['thirdPlace',      'Third Place'],
        ['ptsFirst',        'First in Total Points'],
        ['ptsSecond',       'Second In Total Points'],
        ['playoffs',        'Make Playoffs'],
        ['divWin',          'Win Division'],
        ['playoffWin',      'Playoff Win'],
        ['lastPlace',       'Last Place'],
        ['ptsLast',         'Last in Points'],
        ['prevBonus',       'Previous Dynasty Ranking Bonus'],
        ['permRecordBonus', 'Permanent Record Holder'],
        ['recordBonus',     'Record Holder Bonus'],
        ['bonusText',       'Record']
    ];
    const SHEET_META_KEYS = ['score', 'winPctCol', 'bonusText'];

    let _sheetSync = null;
    function syncDynastyRanks() {
        if (_sheetSync) return _sheetSync;
        _sheetSync = (async () => {
            const text = await (async () => {
                const key = 'c_sheet_ranks';
                try {
                    const hit = localStorage.getItem(key);
                    if (hit) { const { t, d } = JSON.parse(hit); if (Date.now() - t < 30 * MIN) return d; }
                } catch (e) { /* ignore */ }
                const res = await fetch(SHEET_CSV);
                if (!res.ok) throw new Error('sheet ' + res.status);
                const d = await res.text();
                if (!d || d.length < 100) throw new Error('sheet empty');
                try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); } catch (e) { /* quota */ }
                return d;
            })();
            const rows = parseCSV(text);
            const headers = rows[0] || [];
            const colFor = {};
            headers.forEach((h, i) => {
                for (const [k, frag] of SHEET_COLS)
                    if (colFor[k] === undefined && h.includes(frag)) { colFor[k] = i; return; }
            });
            const norm = s => (s || '').toLowerCase().trim();
            let matched = 0;
            rows.slice(1).forEach(r => {
                const who = norm(r[0]); if (!who) return;
                const entry = DYNASTY_RANKS.find(d => norm(d.sheetName) === who || d.owners.includes(who));
                if (!entry) return;
                matched++;
                const num = k => { const n = parseFloat(r[colFor[k]]); return isNaN(n) ? null : n; };
                if (num('score') !== null) entry.score = num('score');
                if (num('winPctCol') !== null) entry.winPct = Math.round(num('winPctCol')) + '%';
                if (colFor.bonusText !== undefined && (r[colFor.bonusText] || '').trim()) entry.bonus = r[colFor.bonusText].trim();
                entry.breakdown = entry.breakdown || {};
                SHEET_COLS.forEach(([k]) => {
                    if (SHEET_META_KEYS.includes(k) || colFor[k] === undefined) return;
                    const v = num(k);
                    if (v !== null && v !== 0) entry.breakdown[k] = v; else delete entry.breakdown[k];
                });
                if (num('winPctCol') !== null) entry.breakdown.winPct = Math.round(num('winPctCol'));
            });
            if (!matched) throw new Error('no owner names matched');
            const top = [...DYNASTY_RANKS].sort((a, b) => b.score - a.score)[0];
            DYNASTY_STATUS.leader = top.team;
            DYNASTY_STATUS.leaderScore = top.score;
            return true;
        })().catch(e => { console.warn('sheet sync failed — using baked-in rankings', e); return false; });
        return _sheetSync;
    }

    return { nflState, playerMap, league, users, rosters, matchups, tradedPicks,
             winnersBracket, allTransactions, allMatchups, trending, fcValues,
             leagueContext, leagueHistory, seasonMatchups, syncDynastyRanks, logoFor };
})();
