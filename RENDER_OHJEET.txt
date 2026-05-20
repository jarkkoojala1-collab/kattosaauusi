# Kattokartta - hakuehdotukset

Lisätty:
- Hakukenttä ehdottaa paikkakuntia kirjoittaessa.
- Esimerkiksi "kirk" ehdottaa Kirkkonummea.
- Backendissä uusi endpoint: /api/suggest?q=kirk&area=uusimaa
- Ehdotukset suosivat ensin valitun alueen paikkoja ja sitten muita tunnettuja paikkoja.
- Ehdotuksen valinta hakee ennusteen suoraan.

Muut mukana:
- Kosteusraja 78 %
- Haku toimii fetchPointForecast + pickNearestForecast -logiikalla.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
