# Kattokartta - tutka + paras sade-ennuste

Tämä on paras käytännön toteutus nykyisillä avoimilla lähteillä:

1. Nyt:
   - näytetään oikea tutkakuva, jos se on saatavilla.
2. Tulevat sadealueet:
   - käytetään sadealue-ennustekuvia, jos niitä on saatavilla.
3. Jos sadealue-ennustekuvia ei ole:
   - käytetään pehmeää Open-Meteo-malliennustetta 30 minuutin välein.

Parannukset:
- Nyt-tilassa näkyy oikea tutkakuva.
- Tuleville ajoille käytetään sadealue-ennustetta tai malliennustetta.
- Malliennuste ei näy palloina eikä karkeana ruudukkona.
- Malliennuste piirretään pehmeänä canvas-sadealueena.
- Sliderissä voi vaihtaa ennusteaikaa.
- Puolen tunnin malliaskelmat säilyvät mukana:
  - Nyt
  - +30 min
  - +60 min
  - +90 min
  - +120 min

Huomio:
Jos sadealue-ennustekuvia on saatavilla, ne ovat ensisijainen lähde. Jos niitä ei ole, sovellus näyttää malliennusteen eikä jää tyhjäksi.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
