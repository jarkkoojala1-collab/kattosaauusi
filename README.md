# Kattokartta - sadeennuste varalähteellä

Korjattu:
- Jos RainViewerin sadealue-ennustekuvia ei ole saatavilla, sovellus hakee varalähteen.
- Varalähde on Open-Meteo-sade-ennuste alueellisena ruutukarttana.
- Varalähde näkyy alueina/ruutuina, ei palloina.
- Toteutunutta sadetta ei käytetä varalähteenä.
- Sadealuekuvat ovat ensisijainen tapa.
- Open-Meteo malliennuste on varatapa, jotta ennuste saadaan aina jostain, jos rajapinta vastaa.
- Slideri toimii molemmissa tapauksissa.
- Alapalkissa näytetään, jos käytössä on varalähde.

Huomio:
Jos sekä RainViewer että Open-Meteo ovat poissa käytöstä, sovellus näyttää virheen. Muuten ennuste haetaan aina saatavilla olevasta avoimesta lähteestä.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
