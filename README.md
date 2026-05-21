# Kattokartta - tutka nyt ja tuleva ennuste

Korjattu:
- Nyt-kohta näyttää oikean tutkakuvan, jos se on saatavilla.
- Tulevat ajat eivät enää riipu RainViewerin epävarmoista ennustekuvista.
- +30, +60, +90 ja +120 min näkyvät aina malliennusteesta, jos Open-Meteo vastaa.
- Sliderissä näkyy:
  - Nyt · tutkakuva
  - +30 min
  - +60 min
  - +90 min
  - +120 min
- Tulevat ajat piirretään pehmeänä sadealueena, ei palloina eikä ruudukkoina.
- Jos tutkakuvaa ei saada, myös nykyhetki näytetään malliennusteella.
- Näin ennuste ei jää pelkkään nykyhetkeen.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
