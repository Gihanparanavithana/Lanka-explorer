# Lanka Explorer – API Notes (Week 04)

## 1. Open-Meteo
- Purpose: Current weather conditions and a 3-day forecast for each destination.
- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Query parameters used: `latitude`, `longitude`, `current`, `daily`, `timezone=Asia%2FColombo`, and `forecast_days=3`.
- Documentation: https://open-meteo.com/en/docs
- What I learned: The response contains nested `current` and `daily` objects. The daily forecast values are parallel arrays, so the same array index represents the same date.

## 2. Frankfurter
- Purpose: Convert destination entry fees from USD to Sri Lankan rupees.
- Endpoint: `https://api.frankfurter.dev/v2/rate/usd/lkr`
- Documentation: https://frankfurter.dev
- What I learned: The response includes a `rate` value representing how many units of the quote currency equal one unit of the base currency. The rate is cached in JavaScript so the app does not request it repeatedly.

## 3. Leaflet + OpenStreetMap
- Purpose: Display an interactive map and destination markers.
- Leaflet CSS/JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css` and `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
- Tile endpoint: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- Documentation: https://leafletjs.com
- What I learned: Leaflet creates the interactive map, while OpenStreetMap supplies map tiles. OpenStreetMap attribution must be displayed on the map.

## Error handling
- Weather and destinations display loading indicators and friendly error messages.
- Currency conversion fails quietly so the original USD entry fee remains visible.
- The map checks whether Leaflet loaded before attempting to create a map.
