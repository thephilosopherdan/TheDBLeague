// ═════════════════════════════════════════════════════════════════════════
//  THE D.B. LEAGUE — LEAGUE CONSTANTS
//  The League of Avoiding Losses to Lifelong Drinking Buddies · Est. 2014
//  Manual league data lives here. Live data comes from js/api.js.
// ═════════════════════════════════════════════════════════════════════════

const LEAGUE_ID = '1314695909581262848';
const LEAGUE_NAME = 'The D.B. League';
const LEAGUE_SUB = 'The League of Avoiding Losses to Lifelong Drinking Buddies';
const DIVISIONS = { 1: 'Division Neat', 2: 'Division On The Rocks' };
const SEASON = 2026;
const SEASON_NUM = 5;            // Season 5 of the 2nd Dynasty (2022–)
const DYNASTY_LABEL = '2nd Dynasty · 2022–Present';

// FantasyCalc — superflex (2 QB), 10-team, 0.5 PPR (verified vs Sleeper scoring)
const FC_PARAMS = { isDynasty: true, numQbs: 2, numTeams: 10, ppr: 0.5 };

// commissioner's rankings sheet (live-synced; constants below are fallback)
const SHEET_ID = '10q2wyd6noh8rCL-vlNDa6ZePfm6xWCGGSJ6KOcEyL90';

// local team logos (override Sleeper avatars) — keyed by owner user_id
const LOGO_OVERRIDES = {
    '368921092460462080':  'logos/dirtydawgs.png',
    '399425495596290048':  'logos/cannolis.png',
    '856696567774683136':  'logos/maplebaddies.png',
    '815024153592745984':  'logos/renodeputies.png',
    '818613649684946944':  'logos/regulators.png',
    '814297857317240832':  'logos/tripelmama.png',
    '818631532867641344':  'logos/wankers.png',
    '858901414712287232':  'logos/broskis.png',
    '1125627970648895488': 'logos/papabear.png',
    '1294496852862865408': 'logos/peeps.png'
};

// ─── DYNASTY RANKINGS (2nd Dynasty — synced from sheet; this is fallback) ────
const DYNASTY_RANKS = [
    { team: 'South Shore Dirty Dawgs',  owners: ['dan', 'philosopherdan'], ownerId: '368921092460462080', score: 294.00, winPct: '53%',
      bonus: 'Division', entered: 2011, sheetName: 'Dan',
      breakdown: { champ: 2, ptsFirst: 2, playoffs: 3, divWin: 2, playoffWin: 4, b2b: 1, winPct: 53, prevBonus: 50, recordBonus: 25 } },
    { team: 'Reno Deputies',            owners: ['ryan t', 'ryguy5188'], ownerId: '815024153592745984', score: 233.00, winPct: '58%',
      bonus: 'Single Season W/L, Streak', entered: 2018, sheetName: 'Ryan T',
      breakdown: { champ: 1, secondPlace: 1, thirdPlace: 1, ptsFirst: 1, playoffs: 3, divWin: 1, playoffWin: 5, winPct: 58, prevBonus: 35 } },
    { team: 'Warren-G Regulators',      owners: ['benson', 'squirtlesquad187'], ownerId: '818613649684946944', score: 232.00, winPct: '53%',
      bonus: 'Division, Streak', entered: 2012, sheetName: 'Benson',
      breakdown: { secondPlace: 1, ptsSecond: 1, playoffs: 3, divWin: 1, playoffWin: 1, ptsLast: 1, winPct: 53, prevBonus: 40, recordBonus: 50 } },
    { team: 'Belgian Tripel Mama',      owners: ['melissa', 'melissanicholle'], ownerId: '814297857317240832', score: 185.00, winPct: '57%',
      bonus: 'High Score Holder', entered: 2017, sheetName: 'Melissa',
      breakdown: { thirdPlace: 1, ptsFirst: 1, playoffs: 3, playoffWin: 2, lastPlace: 1, winPct: 57, prevBonus: 25, recordBonus: 25 } },
    { team: 'Vermont Maple Baddies',    owners: ['tommy', 'tpatuto'], ownerId: '856696567774683136', score: 163.00, winPct: '50%',
      bonus: '-', entered: 2018, sheetName: 'Tommy',
      breakdown: { secondPlace: 1, ptsSecond: 1, playoffs: 3, divWin: 1, playoffWin: 2, winPct: 50, prevBonus: 15 } },
    { team: 'Brotherly Love Broskis',   owners: ['matt', 'mattmccolgan'], ownerId: '858901414712287232', score: 147.00, winPct: '52%',
      bonus: 'Championship', entered: 2022, sheetName: 'Matt',
      breakdown: { champ: 1, thirdPlace: 1, ptsSecond: 2, playoffs: 2, divWin: 1, playoffWin: 3, lastPlace: 2, b2bLast: 1, winPct: 52, prevBonus: 0 } },
    { team: 'North End Cannolis',       owners: ['mark', 'tutes1173'], ownerId: '399425495596290048', score: 143.00, winPct: '53%',
      bonus: '-', entered: 2013, sheetName: 'Mark',
      breakdown: { playoffs: 2, winPct: 53, prevBonus: 30 } },
    { team: 'The Peeps of America',     owners: ['theo', 'thekingteo'], ownerId: '1294496852862865408', score: 125.83, winPct: '80%',
      bonus: 'Baby-Owner', entered: 2025, sheetName: 'Theo',
      breakdown: { playoffs: 1, winPct: 80 } },
    { team: 'Papa Bear Down Chi-Town',  owners: ['joe', 'velezjv'], ownerId: '1125627970648895488', score: 105.00, winPct: '40%',
      bonus: '-', entered: 2024, sheetName: 'Joe',
      breakdown: { playoffs: 1, playoffWin: 1, winPct: 40 } },
    { team: 'Windy City Wankers',       owners: ['jon', 'jmccolgan'], ownerId: '818631532867641344', score: 73.00, winPct: '28%',
      bonus: 'Low Score Holder', entered: 2020, sheetName: 'Jon',
      breakdown: { ptsLast: 3, winPct: 28, prevBonus: 10 } }
];

// ─── DYNASTY VICTOR / REDRAFT TRIGGERS (Amendment VII) ──────────────────────
const DYNASTY_STATUS = {
    leader: 'South Shore Dirty Dawgs',
    leaderScore: 294.00,
    prevVictor: 'The Frank Dynasty (2014–2021)',
    triggers: [
        { label: '>½ champs (1 team, Yr4+)', progress: 2, total: 3, color: 'bg-yellow-500' },
        { label: '6 combined champs (2 teams)', progress: 3, total: 6, color: 'bg-emerald-600' },
        { label: 'Season 10 vote', progress: 5, total: 10, color: 'bg-slate-500' }
    ]
};

// ─── HALL OF FAME (2nd Dynasty champions) ────────────────────────────────────
const HALL_OF_FAME = [
    { season: 2025, seasonNum: 4, team: 'South Shore Dirty Dawgs',   owner: 'Dan · Commissioner',  jacket: 'DB Trophy Champion' },
    { season: 2024, seasonNum: 3, team: 'South Shore Dirty Dawgs',   owner: 'Dan · Commissioner',  jacket: 'DB Trophy Champion' },
    { season: 2023, seasonNum: 2, team: 'Reno Deputies',             owner: 'Ryan T · Reno',       jacket: 'DB Trophy Champion' },
    { season: 2022, seasonNum: 1, team: 'Brotherly Love Broskis',    owner: 'Matt · Philly',       jacket: 'DB Trophy Champion' }
];
const CHAMPION_TEAMS = ['South Shore Dirty Dawgs', 'Reno Deputies', 'Brotherly Love Broskis'];

// ─── PERMANENT RECORDS (2nd Dynasty) ─────────────────────────────────────────
const DYNASTY_RECORDS = [
    { label: 'Single Game High Score', owner: 'Melissa · Tripel Mama',   val: '239.66',  icon: 'fa-fire',        color: 'text-orange-500' },
    { label: 'Single Game Low Score',  owner: 'Jon · Wankers',           val: '54.4',    icon: 'fa-toilet',      color: 'text-slate-400' },
    { label: 'Single Season W/L',      owner: 'Ryan T · Reno',           val: '14-3',    icon: 'fa-star',        color: 'text-yellow-400' },
    { label: 'Longest Winning Streak', owner: 'Ryan T · Reno',           val: '14 Games', icon: 'fa-bolt',       color: 'text-emerald-400' },
    { label: 'Season Long High Score', owner: 'Ryan T · Reno',           val: '2411.36', icon: 'fa-calculator',  color: 'text-sky-400' },
    { label: 'Division Titles (2025)', owner: 'Dan · Ryan T',            val: 'Co-Held', icon: 'fa-crown',       color: 'text-purple-400' }
];

// 1st Dynasty legacy (2014–2021, absorbing 2011–2013) — for the History tab
const FIRST_DYNASTY = {
    victor: 'Dan — The Frank Dynasty',
    finalStandings: [
        ['Dan', 385.50], ['Benson', 286.25], ['Ryan T', 228.75], ['Mark', 186.88], ['Melissa', 133.00],
        ['Tim', 128.13], ['Chris', 125.13], ['Tommy', 106.50], ['Jon', 32.67], ['Roger', -2.33]
    ],
    champions: [
        { season: 2021, team: 'The Rainbow Randolph Show', owner: 'Benson' },
        { season: 2020, team: 'Kick Ass Chew Bubblegum', owner: 'Benson' },
        { season: 2019, team: "Hangin' with Mahomies", owner: 'Mark' },
        { season: 2018, team: 'Blessem Shake and Baker', owner: 'Dan' },
        { season: 2017, team: 'Say what again. Say what again!', owner: 'Dan' },
        { season: 2016, team: "Melania's Tight End", owner: 'Briggs' },
        { season: 2015, team: 'Braavosi Shapeshifters', owner: 'Benson' },
        { season: 2014, team: 'Braavosi Shapeshifters', owner: 'Benson' },
        { season: 2013, team: '—', owner: 'Dan' }, { season: 2012, team: '—', owner: 'Dan' }, { season: 2011, team: '—', owner: 'Dan' }
    ],
    records: [
        { label: 'High Score', val: '231.92', owner: 'Dan (wk4 2020)' },
        { label: 'Low Score', val: '67', owner: 'Mark (2019)' },
        { label: 'Season W/L', val: '14-1', owner: 'Dan (2021)' },
        { label: 'Win Streak', val: '12 games', owner: 'Dan (2018)' },
        { label: 'Season Points', val: '2426.6', owner: 'Dan (2018)' }
    ]
};

// ─── THE BRIGGS — hall of shame (last place) ────────────────────────────────
const BRIGGS_WINNERS = [
    { season: 2025, owner: 'Matt',    team: 'Brotherly Love Broskis' },
    { season: 2024, owner: 'Matt',    team: 'Brotherly Love Broskis' },
    { season: 2023, owner: 'Melissa', team: 'Belgian Tripel Mama' },
    { season: 2022, owner: 'Chris',   team: 'Team cknoth038' },
    { season: 2021, owner: 'Jon',     team: 'Tuck Tales' },
    { season: 2020, owner: 'Roger',   team: 'There Can Only Be One' },
    { season: 2017, owner: 'Briggs',  team: 'New Orleans Clown Punchers' },
    { season: 2016, owner: 'Mark',    team: 'Kicked Him In The Rawls' },
    { season: 2014, owner: 'Chris',   team: 'Team Coffee' }
];

// ─── BADGES ──────────────────────────────────────────────────────────────────
const RECORD_BADGES = {
    'Championship':      { icon: 'fa-trophy',     color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
    'High Score Holder': { icon: 'fa-fire',       color: 'text-orange-400',  bg: 'bg-orange-400/10' },
    'Low Score Holder':  { icon: 'fa-toilet',     color: 'text-slate-400',   bg: 'bg-slate-400/10'  },
    'Single Season W/L': { icon: 'fa-star',       color: 'text-yellow-300',  bg: 'bg-yellow-300/10' },
    'Streak':            { icon: 'fa-bolt',       color: 'text-emerald-400', bg: 'bg-emerald-400/10'},
    'Division':          { icon: 'fa-crown',      color: 'text-purple-400',  bg: 'bg-purple-400/10' },
    'Baby-Owner':        { icon: 'fa-baby',       color: 'text-sky-300',     bg: 'bg-sky-300/10'    },
    'The Briggs':        { icon: 'fa-poo',        color: 'text-amber-700',   bg: 'bg-amber-700/10'  }
};

// Amendment I (2022) D-Score components
const DSCORE_LINE_ITEMS = [
    { key: 'champ',       label: 'Championship',        pts: '+100/ea' },
    { key: 'secondPlace', label: '2nd Place',           pts: '+50/ea'  },
    { key: 'thirdPlace',  label: '3rd Place',           pts: '+25/ea'  },
    { key: 'playoffs',    label: 'Playoff Appearances', pts: '+25/ea'  },
    { key: 'playoffWin',  label: 'Playoff Wins',        pts: '+20/ea'  },
    { key: 'divWin',      label: 'Division Wins',       pts: '+50/ea'  },
    { key: 'ptsFirst',    label: 'Points Leader (Ssn)', pts: '+50/ea'  },
    { key: 'ptsSecond',   label: '2nd in Points (Ssn)', pts: '+25/ea'  },
    { key: 'b2b',         label: 'Back-to-Back Champ',  pts: '+25/ea'  },
    { key: 'lastPlace',   label: 'Last Place (Briggs)', pts: '-50/ea'  },
    { key: 'ptsLast',     label: 'Last in Points',      pts: '-25/ea'  },
    { key: 'b2bLast',     label: 'B2B Last Place',      pts: '-10/ea'  },
    { key: 'winPct',      label: 'Win % (avg × 1)',     pts: 'avg'     },
    { key: 'prevBonus',   label: '1st Dynasty Bonus',   pts: 'static'  },
    { key: 'recordBonus', label: 'Record Holder Bonus', pts: 'static'  }
];

// ─── SEASON HISTORY (2nd Dynasty) ───────────────────────────────────────────
const SEASON_HISTORY = [
    { season: 2022, num: 1, title: 'The Reset', champ: 'Brotherly Love Broskis (Matt)', jacket: 'DB Trophy · Matt',
      facts: ['Full redraft — 2nd Dynasty begins', 'Melissa drops 239.66, still the record'],
      events: ['Frank Dynasty officially archived', 'Auction startup draft', 'Names not yet permanent'] },
    { season: 2023, num: 2, title: 'The Grass Was Lovely', champ: 'Reno Deputies (Ryan T)', jacket: 'DB Trophy · Ryan T',
      facts: ['Ryan T: 2411 season points', 'Melissa takes The Briggs'],
      events: ['Keeper/cap system retooled', 'Snake drafts become the standard'] },
    { season: 2024, num: 3, title: 'Jack and Sally', champ: 'South Shore Dirty Dawgs (Dan)', jacket: 'DB Trophy · Dan',
      facts: ['Jon sets the 54.4 all-time low', 'Joe joins the league'],
      events: ['Commissioner reclaims the trophy', 'Matt earns The Briggs'] },
    { season: 2025, num: 4, title: 'Permanent Ink', champ: 'South Shore Dirty Dawgs (Dan)', jacket: 'DB Trophy · Dan',
      facts: ['Team names become permanent', 'Ryan T: 14-3 and a 14-game heater', 'Theo (Baby-Owner) debuts', 'Matt goes back-to-back… in The Briggs'],
      events: ['Back-to-back for the commissioner', 'Amendment XII protects the kids', 'Redraft trigger at 2/3'] },
    { season: 2026, num: 5, title: 'The Current Season', champ: null, jacket: null, live: true,
      facts: ['Dan chases the three-peat', 'Redraft trigger looms at >½ champs'],
      events: ['Three-peat watch', 'Theo’s sophomore campaign', 'Who takes The Briggs?'] }
];

const RETIRED_OWNERS = [
    { name: 'Kristen Seturins (2014–2018)',            detail: 'Honorable Discharge', honorable: true },
    { name: 'Christopher “Briggs” Briggs (2011–2019)', detail: '2016 Champion · The Briggs is named for him', honorable: true },
    { name: 'Timothy Offutt (2011–2021)',              detail: 'Honorable Discharge', honorable: true },
    { name: 'Christopher Knoth (2011–2023)',           detail: 'Honorable Discharge', honorable: true },
    { name: 'Patrick Dollard (2018–2019)',             detail: 'Other than Honorable', honorable: false },
    { name: 'Cory Knoth (2019)',                       detail: 'Other than Honorable', honorable: false },
    { name: 'Roger Waxman (2020–2025)',                detail: 'Other than Honorable', honorable: false },
    { name: 'Derek Devoe (2018–2019)',                 detail: 'BANNED · Dishonorable Discharge', honorable: false },
    { name: 'Jason McCabe (2014–2016)',                detail: 'BANNED · Bad Conduct Discharge', honorable: false }
];

// ─── CONSTITUTION (condensed from Rev 2026.0) ───────────────────────────────
const CONSTITUTION_META = { revision: '2026.0', commissioner: 'Dan Frank', sidepiece: 'Mark Patuto (DB Side Piece)' };
const CONSTITUTION = [
    { id: 'art1', type: 'article', title: 'Article I: Governing Body', content: `The commissioner is Daniel Frank; the DB Side Piece (director of side bets) is Mark Patuto. The commissioner has autonomous rule — no decision can be overruled by vote. The Side Piece aids in decisions, but the commissioner is by no means required to actually listen to him. Appeals are heard by the office of the commissioner; there is no appeal of the appeal. The commissioner serves until sufficiently bribed or voluntarily resigned.` },
    { id: 'art2', type: 'article', title: 'Article II: League Members', content: `Ten members, no more, no less. Members in good standing retain their franchise. Replacements are added by the commissioner and may keep the inherited roster's keepers or release them to the pool.` },
    { id: 'art3', type: 'article', title: 'Article III: League Setup', content: `No fees at season start — playoff participants may arrange a wager pool. Superflex rosters (2 QB spots), 18 bench. Two five-team divisions (Neat and On The Rocks): divisional opponents twice, others once, plus two rivalry games. Divisions are semi-permanent. The Sleeper chat runs on house rules: if you don't post you don't complain, drink!, majority of votes cast rules, and this is not a democracy.` },
    { id: 'art4', type: 'article', title: 'Article IV: Amendments', content: `Amendments pass by majority of votes cast, or by commissioner decree. In-season amendments apply the following season. Every amendment is named after the member who caused or identified the problem.` },
    { id: 'art5', type: 'article', title: 'Article V: Draft', content: `Startup drafts are auctions; the yearly veteran/rookie draft is a snake ordered by dynasty rankings (lowest rank picks first). Live draft dates trump online availability. The draft may be paused for connectivity, emergencies, accidental bids, wolverine attack (animal, not X-Men), and beer/bathroom breaks. Auto-drafters forfeit all rights to complain.` },
    { id: 'art6', type: 'article', title: 'Article VI: Waivers', content: `Free agency opens when the draft ends. Standard Sleeper waivers (claim = bottom of priority). No acquisition limit. Playoff-eliminated teams cannot make waiver pickups, barring lineup emergencies.` },
    { id: 'art7', type: 'article', title: 'Article VII: Trades', content: `Trades open after the championship and close at the final-week deadline; eliminated teams stop trading after Week 12. No review period — integrity system. Lopsided trades are legal but publicly shameable. Keepers may be traded; no trading players for cap relief.` },
    { id: 'art8', type: 'article', title: 'Article VIII: Regular Season', content: `Regular season through NFL Week 15. Sleeper auto-generates the schedule. Valid lineups expected; lineups lock at game time; fractional scoring means no tiebreakers.` },
    { id: 'art9', type: 'article', title: 'Article IX: Playoffs', content: `Six teams qualify. Division winners get byes; four wildcards by record. One-week playoff rounds in NFL Weeks 16–18. Sleeper's tiebreakers stand — undisputed. Unless you want to dispute them.` },
    { id: 'art10', type: 'article', title: 'Article X: Prizes', content: `The champion wins the DB Trophy: engraving required (or tape-and-sharpie, commissioner's mood depending), a Pop vinyl of the champion's choosing adorns it, the trophy takes the champion's name, and the winner may add something to the top — nothing that targets a specific league member. That's what the last-place trophy is for.` },
    { id: 'art11', type: 'article', title: 'Article XI: Keepers & Cap', content: `Dynasty-style keeper system: 18 keepers, held as long as you like. Non-keepers return to the auction pool. Keeper deadline lands about a month after the year's first rankings. No kickers or DSTs. See Amendments IX and X.` },
    { id: 'art12', type: 'article', title: 'Article XII: Last Place', content: `Last place is settled by Sleeper's toilet bowl among the four non-playoff teams. The loser "wins" The Briggs (the Trophy of Shame, named for 2017 original Christopher "Briggs" Briggs — it lives at Dan's bar mocking losers) and starts the next season with ZERO keepers. Keepers are earned back in thirds: wear a poop-emoji hat and retire your team name for ⅓, fund your trophy-of-shame topper for ⅔, do the hat at a rival's stadium for all of them. If the commissioner loses, penalty powers pass to the league champion.` },
    { id: 'amend1', type: 'amendment', title: 'Amendment I: Dynasty Rankings', content: `Per-season scoring: Championship +100, 2nd +50, 3rd +25, Make Playoffs +25, Playoff Win +20, Division Win +50, Points Leader +50, 2nd in Points +25, Last Place −50, Last in Points −25, Back-to-Back Champion +25, Back-to-Back Last −10. Win% ×1 averaged per season. Added points: longevity bonus, leaving the league −5/yr, Record Holder +25 active / +5 lost. Rank #1 gets first waiver priority and preferential treatment. Rank last: no required drops — but if the last-ranked owner somehow wins it all, there will be a penalty for allowing such a travesty.` },
    { id: 'amend2', type: 'amendment', title: 'Amendment II: Patuto Vulgarity Conduct Code', content: `Gentlemanly conduct expected, with exceptions for attempts at humor (even unfunny ones) and drunken commentary (sobriety not required). Team names stay work-screen safe. When a Patuto takes it too far — and we all know it's always a Patuto — penalties fit the vulgarity.` },
    { id: 'amend3', type: 'amendment', title: 'Amendment III: Back from Wentz You Came', content: `On a season-ending QB injury after the trade deadline: protect the injured QB, drop him for his backup (who must start). Post the protection in the chat first; reclaim him with your first waiver claim after the championship. Deviate and he's fair game.` },
    { id: 'amend6', type: 'amendment', title: 'Amendment VI: Total Victory', content: `The Dynasty Rankings leader at the end of each draft cycle is crowned Dynasty Victor: the era bears their name (diminishing it is punishable), an object of recognition is awarded, and a bonus carries into the next rankings. The 1st Dynasty (2014–2021) belongs to Dan: The Frank Dynasty.` },
    { id: 'amend7', type: 'amendment', title: 'Amendment VII: All Good Things Come to an End', content: `Redraft triggers: one team with more than half the championships after Year 4 (vote), two teams holding 6 combined (vote), Season 10 decision, last-ranked team winning after Year 5 (vote of 5), bottom-3 team winning after Year 7 (vote of 5), first-time winner after Year 10 (automatic). A redraft crowns a Victor and resets rankings with carry-over bonuses (50/40/35…).` },
    { id: 'amend9', type: 'amendment', title: 'Amendment IX: Keeping It Interesting', content: `Forced drops by tier points: tiers score 7/6/6/5/4/3/2/1/1. Required drops by dynasty rank: top 3 drop 7 points, ranks 4–6 drop 5, ranks 7–9 drop 3, last place drops nothing. Thin rosters get exceptions; you can't trade out of obligations.` },
    { id: 'amend10', type: 'amendment', title: 'Amendment X: Keepers & Draft', content: `Yearly draft is a snake ordered by dynasty rankings; auctions reserved for startups. 18 keepers. Compensatory picks reward voluntarily dropping stars: tier-1 RB/WR or tier-1/2 QB earns a 1st, on down the chart.` },
    { id: 'amend11', type: 'amendment', title: 'Amendment XI: A Team Has No Name', content: `As of 2025, team names are permanent: location + mascot, real or fictional, workplace-visible. The goal is legacy — one day our children's children can be dominated by the Southie Thunder Buddies or NJ TurnPikes.` },
    { id: 'amend12', type: 'amendment', title: "Amendment XII: The Kids Aren't Alright", content: `Baby-Owner protections (under age 13-minus-championships-won): parents guide but the Baby-Owner decides; injured/bye starters are auto-replaced by highest projection when the commissioner gets around to it; parents may not trade with their own Baby-Owner; all trades with Baby-Owners must favor them by 25%+ on the FantasyPros chart or face commissioner correction. Mark is the appointed Baby-Owner-Sitter, payable in beer, wine, or liquor. It is ok to beat your wife in this league, but we draw the line at impressionable minds.` }
];

const GOOGLE_DOC_URL = 'https://docs.google.com/document/d/1aNF9sUeMUlxx43qA-3qzqbaCJ-i750WLwMN1jj1pzOc/edit';
