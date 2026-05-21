# Kattokartta - sadetutkan zoom korjattu

Korjattu:
- Sadetutka ei enää pyydä toimimattomia suuria zoom-tasoja.
- Sadetutkatilassa kartan maksimizoom rajoitetaan tasoon 10.
- Jos käyttäjä avaa sadetutkan liian suurella zoomilla, kartta palautetaan automaattisesti zoomiin 10.
- Sadetutkakerrokselle lisätty maxNativeZoom=10 ja maxZoom=10.
- Sadetutkan opacityä nostettu, jotta sateet erottuvat paremmin.
- Pinnoituskarttaan palatessa normaali zoom palautuu käyttöön.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
