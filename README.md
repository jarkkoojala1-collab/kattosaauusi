# Kattokartta - haku korjattu

Korjattu:
- Haku ei ole enää pelkästään Nominatim-paikkahaun varassa.
- Lisätty sovelluksen omaan paikkalistaan mm.:
  - Karjaa
  - Raasepori
  - Tammisaari
  - Hanko
  - Inkoo
  - Siuntio
  - Turku
  - Kaarina
  - Raisio
  - Naantali
  - Lieto
  - Paimio
  - Salo
  - Parainen / Pargas
  - Masku
  - Mynämäki
  - Nousiainen
  - Rusko
  - Aura
  - Kemiönsaari / Kimitoön
- Lisätty alias-haku:
  - Karis -> Karjaa
  - Åbo / Abo -> Turku
  - Ekenäs -> Tammisaari
  - Pargas -> Parainen
- Geokoodaus yrittää nyt useampaa hakumuotoa ja käyttää fetch-timeoutia.
- Hakuehdotukset löytävät paremmin lisätyt paikat.
- Mukana säilyy edellinen pinnoituskartan lähemmäs zoomaus ja FMI-tutkaennuste.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
