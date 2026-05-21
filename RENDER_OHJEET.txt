# Kattokartta - sade-ennuste korjattu

Korjattu:
- Sade-ennuste ei käytä RainViewerin toteutuneita tutkakuvia.
- Sade-ennuste ei myöskään yritä näyttää RainViewerin nowcast-tiiliä.
- Lisätty backend-reitti /api/rain-forecast-map.
- Backend hakee ennusteen MET Norway Nowcastista alueen pisteille.
- Ennuste näyttää 0–2 h:
  - Nyt
  - +1 h
  - +2 h
- Kartalle piirretään ennustettu sademäärä pisteittäin.
- Jos MET Nowcast ei onnistu jollekin pisteelle, käytetään varalähteenä olemassa olevaa piste-ennustettä.
- Slideri vaihtaa oikeaa ennustetuntia.
- Tämä on nyt sade-ennustekartta, ei toteutunut sadetutka.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
