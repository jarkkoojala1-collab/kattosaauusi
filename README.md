# Kattokartta perusversio - haku korjattu

Korjattu:
- Paikkakuntahaku /api/search tehty varmemmaksi.
- Haku palauttaa nyt aina lat/lon, jos paikkakunta löytyy.
- Frontend tarkistaa, että haun tuloksessa on validit koordinaatit.
- Jos paikka löytyy mutta tuntiennuste epäonnistuu, sovellus ei enää kaadu.
- Backendiin lisätty /api/health.
- Backendin syntaksi tarkistettu.
- npm install ja npm run build testattu onnistuneesti.

Testaa Renderissä:
https://SINUN-OSOITE.onrender.com/api/health

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
