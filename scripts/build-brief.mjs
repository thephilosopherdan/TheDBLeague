// build-brief.mjs — generates data/brief.json for Dan's morning page.
// Run by .github/workflows/brief.yml on a schedule. Node 20+ (global fetch).
// Rule #1: never write a stale value — if a fetch fails, omit the key entirely.

const OUT = new URL('../data/brief.json', import.meta.url);
import { writeFileSync } from 'node:fs';

const LAT = 42.1134, LON = -70.8745, LOCATION = 'Hanover, MA';
const DB_LEAGUE = '1314695909581262848';
const ITC_TOP = '1312154762648506368';
const FAMILY = [
  { owner: 'Dan',     userId: '368921092460462080' },
  { owner: 'Melissa', userId: '814297857317240832' },
  { owner: 'Theo',    userId: '1294496852862865408' },
];

const j = async (url) => {
  const r = await fetch(url, { headers: { 'user-agent': 'dbleague-brief/1.0' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};
const tryGet = async (fn) => { try { return await fn(); } catch (e) { console.error(e.message); return undefined; } };

// ---------- weather (Open-Meteo) ----------
const WMO = { 0:'Clear', 1:'Mostly sunny', 2:'Partly cloudy', 3:'Cloudy', 45:'Fog', 48:'Fog',
  51:'Drizzle', 53:'Drizzle', 55:'Drizzle', 61:'Light rain', 63:'Rain', 65:'Heavy rain',
  66:'Freezing rain', 67:'Freezing rain', 71:'Light snow', 73:'Snow', 75:'Heavy snow', 77:'Snow',
  80:'Rain showers', 81:'Rain showers', 82:'Heavy showers', 85:'Snow showers', 86:'Snow showers',
  95:'Thunderstorms', 96:'Thunderstorms', 99:'Thunderstorms' };

async function weather() {
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode` +
    `&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit` +
    `&timezone=America%2FNew_York&forecast_days=2`;
  const d = await j(u);
  const day = d.daily.time[0];
  const hours = [];
  const want = new Set(['08:00','09:00','10:00','11:00','12:00','16:00','17:00','18:00','19:00']);
  d.hourly.time.forEach((t, i) => {
    const [dt, hh] = t.split('T');
    if (dt === day && want.has(hh)) hours.push({
      hour: hh, temp_f: Math.round(d.hourly.temperature_2m[i]),
      precip_chance_pct: d.hourly.precipitation_probability[i],
    });
  });
  return {
    date: day,
    high_f: Math.round(d.daily.temperature_2m_max[0]),
    low_f: Math.round(d.daily.temperature_2m_min[0]),
    precip_chance_pct: d.daily.precipitation_probability_max[0],
    summary: WMO[d.daily.weathercode[0]] ?? 'Mixed',
    afternoon: hours,
  };
}

// ---------- Boston scores (ESPN public JSON) ----------
const TEAMS = [
  ['MLB', 'baseball/mlb/teams/bos'], ['NFL', 'football/nfl/teams/ne'],
  ['NBA', 'basketball/nba/teams/bos'], ['NHL', 'hockey/nhl/teams/bos'],
];

function eventLine(ev) {
  const c = ev.competitions?.[0]; if (!c) return null;
  const comp = c.competitors || [];
  const done = c.status?.type?.completed;
  const name = (x) => x.team?.abbreviation || x.team?.shortDisplayName || '?';
  const score = (x) => x.score?.displayValue ?? x.score?.value ?? x.score ?? '';
  if (done) {
    const [a, b] = [...comp].sort((x, y) => Number(score(y)) - Number(score(x)));
    return `${name(a)} ${score(a)}, ${name(b)} ${score(b)} (F)`;
  }
  const home = comp.find((x) => x.homeAway === 'home'), away = comp.find((x) => x.homeAway === 'away');
  const when = new Date(ev.date).toLocaleTimeString('en-US',
    { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
  return home && away ? `${name(away)} at ${name(home)}, ${when}` : null;
}

async function boston() {
  const last_night = [], today = [];
  const now = Date.now(), dayMs = 864e5;
  for (const [league, path] of TEAMS) {
    const d = await tryGet(() => j(`https://site.api.espn.com/apis/site/v2/sports/${path}/schedule`));
    const events = d?.events; if (!Array.isArray(events) || !events.length) continue;
    const past = events.filter((e) => new Date(e.date) < now && e.competitions?.[0]?.status?.type?.completed);
    const next = events.find((e) => new Date(e.date) >= now - 3 * 36e5 && !e.competitions?.[0]?.status?.type?.completed);
    const lastEv = past[past.length - 1];
    if (lastEv && now - new Date(lastEv.date) < 1.5 * dayMs) {
      const line = eventLine(lastEv); if (line) last_night.push({ league, line });
    }
    if (next && new Date(next.date) - now < dayMs) {
      const line = eventLine(next); if (line) today.push({ league, line });
    }
  }
  return { last_night, today };
}

// ---------- fantasy (Sleeper) ----------
const S = 'https://api.sleeper.app/v1';

async function fantasy() {
  const state = await j(`${S}/state/nfl`);
  const week = state.week, season = state.season, seasonType = state.season_type;
  const out = { week, season_type: seasonType };
  if (seasonType !== 'regular' && seasonType !== 'post') return out;

  const players = await j(`${S}/players/nfl`); // ~5MB, fine server-side
  const proj = await tryGet(async () => {
    const arr = await j(`https://api.sleeper.app/projections/nfl/${season}/${week}?season_type=${seasonType}`);
    const m = {};
    for (const p of arr) {
      const pts = p.stats?.pts_half_ppr ?? p.stats?.pts_ppr;
      if (p.player_id && typeof pts === 'number') m[p.player_id] = pts;
    }
    return Object.keys(m).length ? m : undefined;
  });
  const byes = await tryGet(async () => {
    const games = await j(`https://api.sleeper.app/schedule/nfl/${seasonType}/${season}`);
    const playing = new Set();
    for (const g of games) if (g.week === week && g.status !== 'canceled') { playing.add(g.home); playing.add(g.away); }
    return playing.size ? playing : undefined;
  });

  const leagueData = async (id) => {
    const [rosters, users, matchups] = await Promise.all([
      j(`${S}/league/${id}/rosters`), j(`${S}/league/${id}/users`), j(`${S}/league/${id}/matchups/${week}`),
    ]);
    return { rosters, users, matchups };
  };

  const db = await tryGet(() => leagueData(DB_LEAGUE));
  const projSum = (starters) => {
    if (!proj || !starters) return undefined;
    let t = 0;
    for (const pid of starters) if (pid && pid !== '0') t += proj[pid] ?? 0;
    return Math.round(t * 10) / 10;
  };

  if (db) {
    const teamName = (uid) => db.users.find((u) => u.user_id === uid)?.metadata?.team_name
      ?? db.users.find((u) => u.user_id === uid)?.display_name ?? '?';
    const rec = (r) => `${r.settings?.wins ?? 0}-${r.settings?.losses ?? 0}`;
    out.db_league = [];
    for (const f of FAMILY) {
      const mine = db.rosters.find((r) => r.owner_id === f.userId); if (!mine) continue;
      const myMu = db.matchups.find((m) => m.roster_id === mine.roster_id);
      const oppMu = myMu && db.matchups.find((m) => m.matchup_id === myMu.matchup_id && m.roster_id !== mine.roster_id);
      const opp = oppMu && db.rosters.find((r) => r.roster_id === oppMu.roster_id);
      const entry = { owner: f.owner, team: teamName(f.userId), record: rec(mine) };
      if (opp) {
        entry.opponent_owner = db.users.find((u) => u.user_id === opp.owner_id)?.display_name ?? '?';
        entry.opponent_team = teamName(opp.owner_id);
        entry.opponent_record = rec(opp);
        const op = projSum(oppMu.starters ?? opp.starters);
        if (op !== undefined) entry.opponent_projected = op;
      }
      const mp = projSum(myMu?.starters ?? mine.starters);
      if (mp !== undefined) entry.projected = mp;
      out.db_league.push(entry);
    }
  }

  // Lineup alarm: Dan's starters in BOTH leagues.
  const alarm = [];
  const checkLeague = async (id, label) => {
    const d = id === DB_LEAGUE && db ? db : await tryGet(() => leagueData(id));
    if (!d) return;
    const mine = d.rosters.find((r) => r.owner_id === '368921092460462080'); if (!mine) return;
    for (const pid of mine.starters ?? []) {
      if (!pid || pid === '0') continue;
      const p = players[pid]; if (!p) continue;
      const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
      if (p.injury_status) alarm.push({ owner: 'Dan', league: label, player: name, position: p.position, status: p.injury_status });
      else if (byes && p.team && !byes.has(p.team)) alarm.push({ owner: 'Dan', league: label, player: name, position: p.position, status: 'BYE' });
    }
  };
  await checkLeague(DB_LEAGUE, 'DB');
  await checkLeague(ITC_TOP, 'ITC');
  out.lineup_alarm = alarm;
  return out;
}

// ---------- assemble ----------
const brief = { generated_at: new Date().toISOString(), location: LOCATION };
const w = await tryGet(weather);      if (w) brief.weather = w;
const b = await tryGet(boston);       if (b) brief.boston = b;
const f = await tryGet(fantasy);      if (f) brief.fantasy = f;

writeFileSync(OUT, JSON.stringify(brief, null, 1) + '\n');
console.log('wrote brief.json:', Object.keys(brief).join(', '));
