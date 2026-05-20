# Kattokartta perusversio - haku final

Korjattu:
- Poistettu virheellinen fetchSingleForecast-kutsu.
- /api/search käyttää nyt olemassa olevaa fetchPointForecast + pickNearestForecast -logiikkaa.
- Paikkakuntahaku palauttaa lat/lon, valitun hetken sään, ok-arvon ja pistemäärän.
- Backendin syntaksi tarkistettu.
- npm install ja npm run build testattu onnistuneesti.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
