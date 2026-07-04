// ═════════════════════════════════════════════════════════════════════════
//  THE D.B. LEAGUE — AUTO D-SCORE ENGINE
//  Computes Amendment I (2022) dynasty scoring from Sleeper season history.
//  Manual-only inputs (1st Dynasty bonus, record bonuses) come from DYNASTY_RANKS.
//  NOTE: covers the Sleeper era (2nd Dynasty). ESPN-era seasons live in constants.
// ═════════════════════════════════════════════════════════════════════════

const DSCORE_PTS = {
    champ: 100, secondPlace: 50, thirdPlace: 25, playoffs: 25, playoffWin: 20,
    divWin: 50, ptsFirst: 50, ptsSecond: 25, lastPlace: -50, ptsLast: -25,
    b2b: 25, b2bLast: -10
};

const AUDIT_ITEMS = [
    { key: 'champ',       label: 'Championships',       manual: 'champ' },
    { key: 'secondPlace', label: '2nd Place',           manual: 'secondPlace' },
    { key: 'thirdPlace',  label: '3rd Place',           manual: 'thirdPlace' },
    { key: 'playoffs',    label: 'Playoff Appearances', manual: 'playoffs' },
    { key: 'playoffWin',  label: 'Playoff Wins',        manual: 'playoffWin' },
    { key: 'divWin',      label: 'Division Wins',       manual: 'divWin' },
    { key: 'ptsFirst',    label: 'Points Leader',       manual: 'ptsFirst' },
    { key: 'ptsSecond',   label: '2nd in Points',       manual: 'ptsSecond' },
    { key: 'lastPlace',   label: 'Last Place (Briggs)', manual: 'lastPlace' },
    { key: 'ptsLast',     label: 'Last in Points',      manual: 'ptsLast' },
    { key: 'b2b',         label: 'Back-to-Back Champ',  manual: 'b2b' },
    { key: 'b2bLast',     label: 'B2B Last Place',      manual: 'b2bLast' }
];

function computeDScores(hist) {
    const owners = {};
    const O = id => owners[id] ||= { comp: Object.fromEntries(AUDIT_ITEMS.map(i => [i.key, 0])),
                                     winPcts: [], champYears: [], lastYears: [] };

    (hist || []).forEach(s => {
        // win% counts any played season (live included once games exist)
        s.teams.forEach(t => {
            const g = t.wins + t.losses + t.ties;
            if (t.ownerId && g > 0) O(t.ownerId).winPcts.push(t.wins / g * 100);
        });
        if (!s.complete) return;

        const byPts = [...s.teams].sort((a, b) => b.fpts - a.fpts);
        if (byPts[0]?.ownerId) O(byPts[0].ownerId).comp.ptsFirst++;
        if (byPts[1]?.ownerId) O(byPts[1].ownerId).comp.ptsSecond++;
        const ptsLast = byPts[byPts.length - 1];
        if (ptsLast?.ownerId) O(ptsLast.ownerId).comp.ptsLast++;

        // division winners
        const divs = {};
        s.teams.forEach(t => { if (t.division) (divs[t.division] ||= []).push(t); });
        Object.values(divs).forEach(list => {
            const w = [...list].sort((a, b) => b.wins - a.wins || b.fpts - a.fpts)[0];
            if (w?.ownerId) O(w.ownerId).comp.divWin++;
        });

        const ridOwner = rid => { const t = s.teams.find(x => x.rosterId === rid); return t?.ownerId || null; };

        // winners bracket: playoffs, wins, podium
        if (s.bracket?.length) {
            const participants = new Set();
            s.bracket.forEach(m => [m.t1, m.t2].forEach(r => { if (typeof r === 'number') participants.add(r); }));
            participants.forEach(rid => { const o = ridOwner(rid); if (o) O(o).comp.playoffs++; });
            s.bracket.forEach(m => {
                if ((m.p === undefined || m.p === 1) && typeof m.w === 'number') {
                    const o = ridOwner(m.w); if (o) O(o).comp.playoffWin++;
                }
            });
            const final = s.bracket.find(m => m.p === 1);
            const third = s.bracket.find(m => m.p === 3);
            if (final && typeof final.w === 'number') {
                const cw = ridOwner(final.w), cl = ridOwner(final.l);
                if (cw) { O(cw).comp.champ++; O(cw).champYears.push(s.season); }
                if (cl) O(cl).comp.secondPlace++;
            }
            if (third && typeof third.w === 'number') {
                const o = ridOwner(third.w); if (o) O(o).comp.thirdPlace++;
            }
        }

        // toilet bowl: last place = loser of the losers-bracket final; fallback = lowest standing
        let lastOwner = null;
        if (s.loserBracket?.length) {
            const lfinal = s.loserBracket.find(m => m.p === 1);
            if (lfinal && typeof lfinal.l === 'number') lastOwner = ridOwner(lfinal.l);
        }
        if (!lastOwner) {
            const worst = s.teams[s.teams.length - 1];
            lastOwner = worst?.ownerId || null;
        }
        if (lastOwner) { O(lastOwner).comp.lastPlace++; O(lastOwner).lastYears.push(s.season); }
    });

    // back-to-backs
    Object.values(owners).forEach(o => {
        o.champYears.sort();
        for (let i = 1; i < o.champYears.length; i++)
            if (o.champYears[i] === o.champYears[i - 1] + 1) o.comp.b2b++;
        o.lastYears.sort();
        for (let i = 1; i < o.lastYears.length; i++)
            if (o.lastYears[i] === o.lastYears[i - 1] + 1) o.comp.b2bLast++;
    });

    const result = {};
    Object.entries(owners).forEach(([id, o]) => {
        let pts = 0;
        Object.entries(o.comp).forEach(([k, n]) => pts += (DSCORE_PTS[k] || 0) * n);
        const avgWinPct = o.winPcts.length ? o.winPcts.reduce((a, b) => a + b, 0) / o.winPcts.length : 0;
        const dyn = DYNASTY_RANKS.find(d => d.ownerId === id);
        const manualBonus = (dyn?.breakdown?.prevBonus || 0) + (dyn?.breakdown?.permRecordBonus || 0)
                          + (dyn?.breakdown?.recordBonus || 0) + (dyn?.manualAdjust || 0);
        result[id] = { comp: o.comp, avgWinPct, basePts: pts, manualBonus,
                       total: pts + avgWinPct + manualBonus };
    });
    return result;
}
