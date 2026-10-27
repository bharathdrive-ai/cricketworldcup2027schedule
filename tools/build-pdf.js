// Rebuilds CWC2027_Schedule_Reference.pdf (the source document for the "Ask the schedule" CAG agent) from the data in index.html.
// Usage, from the repo root:
//   node tools/build-pdf.js index.html schedule-source.html
//   msedge --headless=new --no-pdf-header-footer --print-to-pdf=CWC2027_Schedule_Reference.pdf schedule-source.html
// then delete schedule-source.html. Rebuild the PDF after every fixture change so the agent stays in step with the site.
const fs=require("fs");
const src=fs.readFileSync(process.argv[2],"utf8");
const a=src.indexOf("const VENUES = {"), b=src.indexOf("\n",src.indexOf("const DAYS ="));
const D=new Function(src.slice(a,b)+"\nreturn {VENUES,SEEDS,STAGES,matches,TEAMS,GROUP,DAYS,LABEL};")();
const {VENUES,SEEDS,STAGES,matches,TEAMS,GROUP,DAYS,LABEL}=D;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fd=d=>`${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]} 2027`;
const side=s=>s.seed?`${esc(s.name)} (${s.seed})`:esc(s.name);
const stageRows=[["Super Series",["ss"],"ss"],["Group Stage",["ga","gb"],"g"],["Super 7",["s7"],"s7"],["Semi-finals",["sf"],"sf"],["Final",["f"],"f"]];
const WHO={ss:"Super Series sides 1, 2 and 3 (decided at the Qualifier); all games in Windhoek",g:"Group A and Group B (teams listed in section 4)",s7:"Seven teams; slots shown by seed (A1–A3, B1–B3, AB4)",sf:"Super 7 1st v 4th; Super 7 2nd v 3rd",f:"Winners of the two semi-finals"};
const grp=g=>TEAMS.filter(t=>GROUP[t]===g);
const venueOrder=Object.keys(VENUES);
const fixtureRow=m=>`<tr><td class=n>${m.no}</td><td class=nw>${fd(m.date)}</td><td class=nw>${LABEL[m.cls]}</td><td>${side(m.home)} <span class=v>v</span> ${side(m.away)}</td><td>${esc(m.stadium)}, ${esc(m.city)}, ${esc(m.country)}</td><td class=nw>${m.time} ${m.dn?"(day/night)":"(day)"}</td></tr>`;
const fixHead=`<thead><tr><th>No.</th><th>Date</th><th>Stage</th><th>Match</th><th>Venue</th><th>Start (SAST)</th></tr></thead>`;
const first=matches[0], fin=matches[matches.length-1];
const html=`<!doctype html><html lang=en><head><meta charset=utf-8><title>ICC Men's Cricket World Cup 2027 – Schedule Reference</title>
<style>
@page{size:A4;margin:16mm 14mm 18mm;@bottom-center{content:"CWC 2027 Schedule Reference · page " counter(page) " of " counter(pages);font:8pt "Segoe UI",Arial,sans-serif;color:#667}}
body{font:9.5pt/1.45 "Segoe UI",Arial,sans-serif;color:#14213d;margin:0}
h1{font-size:21pt;margin:0 0 2pt;color:#0b1a33}h2{font-size:13pt;margin:16pt 0 5pt;color:#0b3d91;border-bottom:1.5pt solid #0b3d91;padding-bottom:2pt;break-after:avoid}
h3{font-size:10.5pt;margin:10pt 0 3pt;break-after:avoid}.sub{font-size:11pt;color:#334;margin:0 0 8pt}
.note{background:#eef4fb;border-left:3pt solid #0b3d91;padding:6pt 9pt;margin:8pt 0;font-size:8.8pt}
table{width:100%;border-collapse:collapse;margin:4pt 0 6pt;font-size:8.6pt}th,td{border:.6pt solid #b8c4d6;padding:3pt 5pt;text-align:left;vertical-align:top}
th{background:#0b3d91;color:#fff;font-weight:600;-webkit-print-color-adjust:exact;print-color-adjust:exact}tr{break-inside:avoid}
tbody tr:nth-child(even) td{background:#f4f7fb;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.n{text-align:right;width:22pt}.nw{white-space:nowrap}.v{color:#889}ul{margin:3pt 0;padding-left:16pt}.kv td:first-child{width:110pt;font-weight:600}
.cols{display:flex;gap:30pt}
</style></head><body>
<h1>ICC Men's Cricket World Cup 2027</h1>
<p class=sub>Schedule reference: fixtures, venues, teams and stages</p>
<div class=note><b>About this document.</b> A compiled reference for the ICC Men's Cricket World Cup 2027 (50-over format). It is <b>not an official ICC publication</b>. Fixtures are taken from the ICC's announced schedule and cross-checked with Wikipedia; start times come from Wikipedia. Compiled 27 October 2026 from the data behind the interactive schedule at https://bharathdrive-ai.github.io/cricketworldcup2027schedule/. Fixtures may change; check the ICC for the latest.</div>

<h2>1. Tournament at a glance</h2>
<table class=kv><tbody>
<tr><td>Tournament</td><td>ICC Men's Cricket World Cup 2027 (One Day International, 50 overs a side)</td></tr>
<tr><td>Hosts</td><td>South Africa, Zimbabwe and Namibia</td></tr>
<tr><td>Dates</td><td>${fd(first.date)} to ${fd(fin.date)} (${DAYS.length} match days)</td></tr>
<tr><td>Teams</td><td>14: ${TEAMS.length} named in the fixtures below, plus four sides decided at the World Cup Qualifier (February–March 2027)</td></tr>
<tr><td>Matches</td><td>${matches.length}</td></tr>
<tr><td>Venues</td><td>${venueOrder.length} grounds in ${new Set(venueOrder.map(v=>VENUES[v].country)).size} countries</td></tr>
<tr><td>Opening match</td><td>Match 1, ${fd(first.date)}, ${side(first.home)} v ${side(first.away)}, ${first.stadium}, ${first.city}</td></tr>
<tr><td>Final</td><td>Match ${fin.no}, ${fd(fin.date)}, ${fin.stadium}, ${fin.city}, ${fin.country}</td></tr>
<tr><td>Start times</td><td>Local time, SAST (UTC+2), shared by all three host countries. 10:00 = day match; 12:30 = day/night match.</td></tr>
</tbody></table>

<h2>2. Stages</h2>
<table><thead><tr><th>Stage</th><th>Dates (2027)</th><th>Matches</th><th>Who plays</th></tr></thead><tbody>
${stageRows.map(([n,c,k])=>`<tr><td><b>${n}</b></td><td class=nw>${STAGES[k].dates}</td><td class=n>${matches.filter(m=>c.includes(m.cls)).length}</td><td>${WHO[k]}</td></tr>`).join("")}
</tbody></table>

<h2>3. Venues</h2>
<table><thead><tr><th>City</th><th>Stadium</th><th>Country</th><th>Capacity</th><th>Matches</th><th>Match numbers</th></tr></thead><tbody>
${venueOrder.map(v=>{const V=VENUES[v],ms=matches.filter(m=>m.city===v);return `<tr><td><b>${esc(v)}</b>${V.alt?` (also ${esc(V.alt)})`:""}</td><td>${esc(V.stadium)}</td><td>${V.country}</td><td class=n>${V.cap.toLocaleString("en-GB")}</td><td class=n>${ms.length}</td><td>${ms.map(m=>m.no).join(", ")}</td></tr>`}).join("")}
</tbody></table>

<h2>4. Teams and groups</h2>
<div class=cols>
<div><h3>Group A</h3><ul>${grp("ga").map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
<div><h3>Group B</h3><ul>${grp("gb").map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>
</div>
<h3>Super 7 seeds</h3>
<table><thead><tr><th>Seed</th><th>Team</th></tr></thead><tbody>${Object.entries(SEEDS).map(([k,t])=>`<tr><td>${k}</td><td>${t}</td></tr>`).join("")}</tbody></table>
<p>Placeholder sides in the fixtures: <i>Super Series 1–3</i> and <i>Qualifier A/B</i> are decided at the World Cup Qualifier; <i>Super 7 1st–4th</i> are the top four of the Super 7; <i>Winner SF1/SF2</i> are the semi-final winners.</p>

<h2>5. Full fixture list</h2>
<table>${fixHead}<tbody>${matches.map(fixtureRow).join("")}</tbody></table>

<h2>6. Fixtures by team</h2>
${TEAMS.map(t=>{const ms=matches.filter(m=>m.home.name===t||m.away.name===t);return `<h3>${esc(t)}${GROUP[t]?` (${LABEL[GROUP[t]]})`:""}: ${ms.length} matches</h3><table>${fixHead}<tbody>${ms.map(fixtureRow).join("")}</tbody></table>`}).join("")}

<h2>7. Notes</h2>
<ul>
<li>All times are local South Africa Standard Time (SAST, UTC+2). Zimbabwe and Namibia use the same time.</li>
<li>Match 8 (South Africa v New Zealand) is listed on 8 October 2027, the date in the ICC media release; some fixture lists show 9 October.</li>
<li>Super 7 fixtures show seeded slots; the team names in brackets are the pre-seeded teams.</li>
<li>Centurion is also known as Tshwane, and KuGompo City as East London.</li>
</ul>
</body></html>`;
fs.writeFileSync(process.argv[3],html);console.log("html written",matches.length,"matches",TEAMS.length,"teams",DAYS.length,"days");
