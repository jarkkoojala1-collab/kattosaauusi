# Kattokartta - sadeennuste 30 minuutin välein

Muutokset:
- Sadealue-ennusteen varalähde näyttää nyt 0–2 h aikavälin 30 minuutin välein.
- Sliderin askeleet:
  - Nyt
  - +30 min
  - +60 min
  - +90 min
  - +120 min
- Open-Meteo tarjoaa tunnin välein ennustetta, joten 30 minuutin väliarvot lasketaan interpoloimalla vierekkäisten tuntien sademääristä.
- Pehmeä sadealuekartta säilyy.
- Ei palloja eikä näkyvää ruudukkoa.
- Cache lyhennetty 4 minuuttiin.

Huomio:
Jos ensisijainen sadealuekuvakerros on saatavilla, se toimii kuten ennen. Varalähteenä oleva Open-Meteo-sadealuekartta käyttää 30 min välejä.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
