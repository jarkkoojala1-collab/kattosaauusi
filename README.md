# Kattokartta - sade-ennuste seuraavat 2 h

Muutokset:
- Sadetutkakartta ei enää käytä toteutuneita sadekuvia.
- RainVieweristä käytetään nyt data.radar.nowcast -ennustekuvia.
- Slideri alkaa ensimmäisestä ennustekuvasta ja näyttää tulevaa sadetta.
- Jos ennustekuvia ei ole saatavilla, sovellus näyttää virheilmoituksen eikä näytä toteutunutta sadetta harhaanjohtavasti.
- Yläpalkin nappiteksti muutettu selkeämmäksi: Sade-ennuste.
- Alapalkkiin lisätty virheilmoituspaikka, jos ennustekuvia ei saada.
- Muu mobiilioptimointi ja aluekohtainen keskitys säilyvät mukana.

Huomio:
RainViewerin nowcast-ennusteiden määrä ja aikaväli riippuvat palvelun kulloinkin palauttamasta datasta.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
