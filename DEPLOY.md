# Deploying The D.B. League Site

This folder is the complete site: `index.html`, `js/` (constants, api, dscore, recap, app),
`logos/` (league + all 10 team logos), `site.webmanifest`.

## First-time setup

1. Create a new GitHub repo (e.g. `dbleague`) under the `tpdad` account.
2. Copy everything in this folder EXCEPT `_itc-leftovers/` into the repo.
3. Push to `main`, then Settings → Pages → Deploy from a branch → `main` / root.
4. Site goes live at `tpdad.github.io/<repo>/` in ~60s.

## What's live vs manual

- Live from Sleeper: standings, matchups, transactions, history (Sleeper era), owner careers,
  record book, playoff/Briggs odds, D-Score auto-audit.
- Live from the commissioner's Google Sheet (id in constants.js): dynasty rankings —
  rows are keyed by OWNER FIRST NAME (Dan, Ryan T, Benson…). Keep sharing = anyone with link.
- Manual in `js/constants.js`: HALL_OF_FAME, DYNASTY_RECORDS, BRIGGS_WINNERS, SEASON_HISTORY,
  FIRST_DYNASTY archive, CONSTITUTION (site is at Rev 2026.0), RETIRED_OWNERS.
  New season: bump SEASON/SEASON_NUM + LEAGUE_ID.
- Team logos: `logos/` files, mapped by owner user_id in LOGO_OVERRIDES (constants.js).
  New logo? Drop the file in logos/ and update the map.

## Notes

- The auto-audit covers the Sleeper era only (2nd Dynasty). ESPN-era achievements live in
  the manual "1st Dynasty Bonus" column of the rankings — by design.
- Toilet-bowl (Briggs) detection uses the losers-bracket final; verify after season 1
  completes on Sleeper and tell Claude if the wrong loser is flagged.
- `_itc-leftovers/` = unused files inherited from the It's the Climb codebase; delete anytime.

## Arcade

Endzone Run (DB League edition) ships in `arcade/` — own page, own PWA (landscape fullscreen,
offline via `arcade/sw.js`, save key `endzone_run_db_v1`). All 10 defenses use the team sprites
from Dan's pixel sheet; the ladder is the DB dynasty rankings; the top of the ladder is
defended by the Dirty Dawgs, and, well… commissioner's privilege carried over. Deploy the
whole `arcade/` folder with the site. Bump the CACHE string in `arcade/sw.js` when updating.
