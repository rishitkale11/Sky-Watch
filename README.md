# SkyWatch 🛰️

A live dashboard for everything moving through the sky — weather, aircraft, the ISS, ISRO missions, and rocket launch countdowns. Built as a static website 

## What's inside

```
skywatch/
├── index.html          → Home page
├── forecast.html        → 7-day weather forecast + hourly chart
├── map.html            → Interactive world map
├── aircraft.html        → Live aircraft radar embed
├── iss.html             → ISS live position tracker
├── isro.html            → ISRO mission timeline
├── launches.html        → Live launch countdowns
├── css/                 → One stylesheet per page + base.css (shared)
├── js/                  → One script per page + core.js (shared)
└── README.md            → You are here
```


## Live data sources 

- **Weather** — [Open-Meteo](https://open-meteo.com)
- **Map tiles** — [CARTO](https://carto.com) dark tiles + [OpenStreetMap](https://www.openstreetmap.org) data, via [Leaflet.js](https://leafletjs.com)
- **Aircraft radar** — embedded [Flightradar24](https://www.flightradar24.com) live map
- **ISS position** — [WhereTheISS.at](https://wheretheiss.at)
- **Launch schedule** — [Launch Library 2](https://thespacedevs.com) by The Space Devs
- **ISRO timeline** — hand-written, fact-checked mission history (static data, no API)


