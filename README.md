# Kattokartta - Render-julkaisuvalmis versio

Tämä versio on tehty niin, että Renderissä tarvitsee julkaista vain yksi palvelu.

Frontend buildataan kansioon:

frontend/dist

Backend tarjoilee frontendin automaattisesti samasta osoitteesta.

## Paikallinen testi Windowsissa

Kaksoisklikkaa:

KAYNNISTA_PAIKALLISESTI.bat

Avaa sen jälkeen:

http://localhost:3001

## Julkaisu Renderiin

### 1. Tee GitHub-repo

1. Mene https://github.com
2. Luo uusi repository, esimerkiksi:
   kattokartta
3. Lataa tämän ZIP-paketin sisältö siihen repositoryyn.

Helpoin aloittelijalle:
- pura ZIP
- avaa GitHub repository selaimessa
- paina Add file / Upload files
- vedä kaikki puretun kansion tiedostot GitHubiin
- paina Commit changes

### 2. Luo Render-palvelu

1. Mene https://render.com
2. Kirjaudu sisään GitHubilla
3. Paina New +
4. Valitse Web Service
5. Valitse GitHub-repo: kattokartta

### 3. Render asetukset

Name:
kattokartta

Environment:
Node

Build Command:
npm run render-build

Start Command:
npm start

Plan:
Free riittää testiin.

### 4. Julkaise

Paina Create Web Service.

Render rakentaa sovelluksen ja antaa osoitteen, esimerkiksi:

https://kattokartta.onrender.com

## Tärkeää

Renderin ilmaisversio voi nukahtaa, jos sitä ei käytetä hetkeen.
Ensimmäinen avaus voi silloin kestää vähän.

Oma sijainti toimii parhaiten Renderin HTTPS-osoitteessa.



KORJAUS:
Frontend build-komento on nyt oikein:

npm run build --prefix frontend

ja frontend käyttää komentoa:

vite build

Jos Renderissä tulee virhe, varmista nämä asetukset:

Build Command:
npm run render-build

Start Command:
npm start



KORJAUS:
Backendin server.js on korjattu kokonaan.
Aiempi Render-virhe oli:
SyntaxError: Unexpected end of input

Tässä paketissa server.js on tarkistettu Node-komennolla:
node --check backend/server.js

Render-asetukset:
Build Command: npm run render-build
Start Command: npm start


Zoom-korjaus:
- Kartta siirtyy haettuun paikkaan tai omaan sijaintiin vain kerran.
- Sen jälkeen käyttäjä voi zoomata ja liikuttaa karttaa normaalisti.


Korjaus:
- Edellisen version rikkonut muutos peruttu.
- Oman sijainnin zoomauskorjaus tehty varovaisemmin.
- Sivun pitäisi jälleen käynnistyä normaalisti.



VALKOISEN SIVUN KORJAUS:
- Kartan keskitys tehty turvallisemmaksi.
- Oma sijainti ei enää pakota karttaa jatkuvasti.
- Frontend käyttää Renderissä samaa osoitetta API-kutsuihin.
- Backend tarjoilee frontendin Renderissä.



TESTATTU KORJAUS:
- frontend build testattu komennolla: npm run build --prefix frontend
- backend syntax testattu komennolla: node --check backend/server.js
- frontend/package.json siistitty
- lisätty virheruutu, jotta mahdollinen frontend-virhe ei näy valkoisena sivuna

Render:
Build Command: npm run render-build
Start Command: npm start



TÄRKEÄ KORJAUS:
Tämä versio EI käytä enää komentoja:
npm install --prefix backend
npm install --prefix frontend

Render asentaa kaikki paketit yhdestä juuritason package.json-tiedostosta.

Render-asetukset:
Build Command: npm run render-build
Start Command: npm start

Paina Renderissä:
Manual Deploy -> Clear build cache & deploy



KORJAUS:
- Korjattu frontend-virhe: selectedMoveKey is not defined.
- Lisätty puuttuva selectedMoveKey-tila.
- Haun, karttapisteen ja oman sijainnin karttasiirtymä toimii ilman virhettä.



KORJAUS:
- Korjattu Render build -virhe: sh: 1: vite: not found
- Build-komento on nyt: npx vite build --root frontend
- Render asentaa paketit juureen ja ajaa Viten juuresta.
