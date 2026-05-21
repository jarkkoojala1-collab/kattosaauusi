# Kattokartta - tarkempi sadealue-ennuste

Parannettu:
- Varalähteen sadealue-ennuste on nyt tarkempi.
- Open-Meteo-alueverkko tihennetty:
  - Uusimaa noin 0.16° x 0.24°
  - Pirkanmaa noin 0.16° x 0.22°
- Ruudut piirretään hieman päällekkäin, jolloin sade näyttää enemmän yhtenäiseltä sadealueelta.
- Kartalle lisätty pehmeä blur/saturate, jotta ruutujen rajat eivät näy yhtä rumasti.
- Hyvin pienet sadearvot suodatetaan pois.
- Väri- ja läpinäkyvyysasteikkoa parannettu.
- Hakuja rajoitetaan backendissä, jotta Render ei kuormitu liikaa.
- Cache lyhennetty 6 minuuttiin.

Toimintaperiaate:
1. Ensisijaisesti käytetään RainViewerin sadealue-ennustekuvia, jos niitä on saatavilla.
2. Jos niitä ei ole saatavilla, käytetään tarkempaa Open-Meteo-sadealuevaralähdettä.
3. Varalähde ei ole palloennuste, vaan ruutupohjainen sadealuekerros.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
