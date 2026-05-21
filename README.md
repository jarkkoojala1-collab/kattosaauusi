# Kattokartta - sadetutka sliderillä ja sadeasteikolla

Muutokset:
- Sadetutka käyttää hallittua karttakerrosta sovelluksen omassa kartassa.
- Sadetutkan alareunan valmiit kellonajat/päivämäärät eivät näy.
- Lisätty oma liukusäädin tutkakuvan kellonajan vaihtamiseen.
- Lisätty Toista/Tauko, edellinen ja seuraava painikkeet.
- Lisätty sadeasteikko kartan sivuun.
- Sadetutka rajataan Suomen alueelle, jotta turhia tiiliä ei ladata.
- Sadetutkatilassa zoom rajataan toimivalle tasolle 8.
- Pinnoituskartan pisteet piilotetaan sadetutkatilassa.
- Lähisadearvio MET Norway Nowcastista säilyy mukana.
- Huoltotilan kirjautuminen säilyy mukana.

Huomio:
Sadeasteikko on suuntaa-antava tutkavärien tulkinta. Tarkka mm/h-arvo vaihtelee tutkatuotteen mukaan.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
