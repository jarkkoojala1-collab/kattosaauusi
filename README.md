# Kattokartta - paras sadeennuste

Toteutus:
- Ensisijaisesti käytetään sadealue-ennustekuvia, jos niitä on saatavilla.
- Jos sadealuekuvia ei ole saatavilla, käytetään tarkkaa Open-Meteo-ennustealuetta.
- Open-Meteo-varalähde ei piirrä palloja tai karkeita ruutuja.
- Varalähde piirretään pehmeänä canvas-sadealuekerroksena.
- Kartalla sade näyttää yhtenäisemmältä alueelta.
- Backend hakee Open-Meteo-dataa batch-haulla, joten tarkempi verkko ei kuormita yhtä pahasti.
- Verkko on tihennetty:
  - Uusimaa noin 0.12° x 0.16°
  - Pirkanmaa noin 0.12° x 0.16°
- Cache 5 minuuttia.
- Slideri näyttää sade-ennusteen eri ajankohtia.

Miksi tämä on parempi:
- Ei palloja.
- Ei isoja rumia ruutuja.
- Sade näkyy pehmeänä alueena.
- Jos ensisijainen sadealuekerros puuttuu, sovellus saa silti ennusteen toisesta avoimesta lähteestä.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
