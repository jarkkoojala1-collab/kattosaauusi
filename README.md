# Kattokartta - sadealue-ennuste, ei palloja

Korjattu:
- Palloennuste poistettu näkyvistä.
- Kartalla näkyy sadealuekerros, ei yksittäisiä palloja.
- Sadealuekerros käyttää RainViewerin radar.nowcast-ennustekuvia.
- Toteutunutta radar.past-historiaa ei käytetä.
- Jos ennustettuja sadealuekuvia ei ole saatavilla, näytetään virhe eikä palloja.
- Slideri vaihtaa ennustekuvia.
- Mobiili- ja zoom-korjaukset säilyvät mukana.

Huomio:
Tämä näyttää sadealueet karttakerroksena. Se ei ole pistepohjainen palloennuste.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
