# Cricket World Cup 2027 Schedule

An interactive schedule for the ICC Men's Cricket World Cup 2027 (2 October – 21 November 2027), hosted by South Africa, Zimbabwe and Namibia.

> **Unofficial fan site.** Not affiliated with, endorsed by or connected to the International Cricket Council (ICC). Tournament names and marks belong to their owners. The site icon is an original design.

**Live site:** https://www.talent-hunt.net (also on GitHub Pages: https://bharathdrive-ai.github.io/cricketworldcup2027schedule/ and Vercel: https://cricketworldcup2027schedule.vercel.app)

## Features

- All 57 matches: Super Series, Group Stage, Super 7, semi-finals and final
- Multi-select filters for teams, venues, dates and stages, saved in your browser
- Head-to-head view when two teams are selected
- Map, list and calendar views
- Map drawn inside a cricket ground: venue pins with match counts, and stands made of benches for every match plus stage, venue and team filters
- Themes: Day Night (navy, default), Cloudy (light sky blue), Clear Light (light green) and Dry Hot (yellow and red); works on phones

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the system, data model, user flow, sequence and deployment diagrams.

## Schedule PDF

[CWC2027_Schedule_Reference.pdf](CWC2027_Schedule_Reference.pdf) is a 9-page printable reference built from the same data as the site: stages, venues, teams and groups, all 57 fixtures and fixtures by team. Its text can be extracted, so it also works as a source document for CAG or RAG examples. It is a compiled reference, not an official ICC publication.
## Ask the schedule (CAG agent)

The **Ask the schedule** button opens a chat assistant that answers questions about fixtures, venues, stages and start times. It uses cache-augmented generation (CAG): the Vercel function [`api/ask.js`](api/ask.js) sends the whole schedule PDF to Gemini as the first part of every request, so answers come only from that document, and Gemini's implicit cache reuses it between questions (about 5,000 tokens per question, most of them cached; answers in 2–5 seconds).

- Runs on Vercel; the GitHub Pages copy calls the Vercel endpoint. The button appears only when the function has a key.
- Needs the Vercel environment variable `GOOGLE_API_KEY` (optional `GEMINI_MODELS`, default `gemini-3.5-flash-lite,gemini-3.6-flash`).
- In answers, venue names (city, stadium or alternative name) link to that venue on the map, and match numbers link to the fixture in the list.
- Limits: 500-character questions, the last 6 messages as context, and 8 questions a minute per visitor.
- After changing a fixture, rebuild the PDF with [`tools/build-pdf.js`](tools/build-pdf.js) so the assistant stays in step with the site.

## Data

Fixtures are from the ICC's announced schedule, cross-checked with Wikipedia. Start times (10:00 day, 12:30 day/night, local SAST) come from Wikipedia. Qualifier slots and the Super Series teams are decided at the World Cup Qualifier (Feb–Mar 2027). Super 7 slots show the pre-seeded teams. Country borders are from Natural Earth (public domain) via world-atlas.

The site is a single static `index.html` with no build step. Open it in a browser, or serve it with GitHub Pages or Vercel.
