# Cricket World Cup 2027 Schedule

An interactive schedule for the ICC Men's Cricket World Cup 2027 (2 October – 21 November 2027), hosted by South Africa, Zimbabwe and Namibia.

**Live site:** https://bharathdrive-ai.github.io/cricketworldcup2027schedule/ (also on Vercel: https://cricketworldcup2027schedule.vercel.app)

## Features

- All 57 matches: Super Series, Group Stage, Super 7, semi-finals and final
- Multi-select filters for teams, venues, dates and stages, saved in your browser
- Head-to-head view when two teams are selected
- Map, list and calendar views
- Map drawn inside a cricket ground: venue pins with match counts, and stands made of benches for every match plus stage, venue and team filters
- Themes: System, Light, Dark (default), Green and Sunset; works on phones

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the system, data model, user flow, sequence and deployment diagrams.

## Schedule PDF

[CWC2027_Schedule_Reference.pdf](CWC2027_Schedule_Reference.pdf) is a 9-page printable reference built from the same data as the site: stages, venues, teams and groups, all 57 fixtures and fixtures by team. Its text can be extracted, so it also works as a source document for CAG or RAG examples. It is a compiled reference, not an official ICC publication.

## Data

Fixtures are from the ICC's announced schedule, cross-checked with Wikipedia. Start times (10:00 day, 12:30 day/night, local SAST) come from Wikipedia. Qualifier slots and the Super Series teams are decided at the World Cup Qualifier (Feb–Mar 2027). Super 7 slots show the pre-seeded teams. Country borders are from Natural Earth (public domain) via world-atlas.

The site is a single static `index.html` with no build step. Open it in a browser, or serve it with GitHub Pages or Vercel.
