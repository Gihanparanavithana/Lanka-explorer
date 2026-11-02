# Lanka Explorer – Week 05

## Run locally
1. Extract the project folder.
2. Open the folder in Visual Studio Code.
3. Start the project with VS Code Live Server (or another local HTTP server).
4. Open `index.html` through the local server. Do not open pages directly with `file://`, because `fetch()` needs an HTTP server.
5. Use the Destinations page to open a destination details page and test weather, currency conversion, and maps.

## Week 04 integrations
- Open-Meteo: current weather and a 3-day forecast.
- Frankfurter: cached USD-to-LKR exchange rate for paid destination entry fees.
- Leaflet + OpenStreetMap: destination maps and marker popups.
- Loading spinners and friendly API error messages.
- See `API-NOTES.md` for endpoints and documentation notes.

External API features require an internet connection. The currency conversion is intentionally hidden if its API is unavailable; the original USD fee remains visible.

## Week 05 features
- Add/remove destinations in My Trip; selected destination IDs and traveller count persist in localStorage.
- My Trip calculates group entry-fee totals in USD and LKR (USD total remains available if currency API fails).
- Dark mode preference persists and follows the device theme if no choice has been saved.
- Fixed repeated “Free” price labels.

## APIs
- Open-Meteo weather and forecast
- Frankfurter USD/LKR exchange rate
- Leaflet with OpenStreetMap tiles

## Testing and audit
Run through the Week 05 checklist at 375px and 1280px. Lighthouse scores and deployment URL should be added after you run those checks; they have not been fabricated here.

## Visual updates
- Destination card photography is referenced from Unsplash URLs in `data/destinations.json` and therefore requires internet access.
- The home hero uses the local generated image `image/lanka-coast-hero.webp`, so that hero image works offline.
- Added scroll-reveal entrance animations, animated ambient page background, slow hero pan/shimmer, card hover motion, and reduced-motion accessibility support.

## Premium UI refresh
- Added a locally stored, generated Sri Lankan coastal hero image at `image/lanka-coast-hero.webp`.
- Applied a consistent translucent navigation bar, upgraded page panels/cards/forms/tables, and refreshed light/dark colour styling.
- Added subtle animated ambient background, hero image pan/shimmer, and refined hover/focus states across the pages.
- Added the theme toggle to the Home page so all five pages offer the same theme control.
- Motion respects the visitor's `prefers-reduced-motion` accessibility setting.
