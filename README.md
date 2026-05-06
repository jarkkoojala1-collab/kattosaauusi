# Kattokartta - Render LOPULLINEN

Tämä paketti korjaa Render-buildin ongelmat.

Render-asetukset:

Root Directory:
jätä tyhjäksi

Build Command:
npm run render-build

Start Command:
npm start

Mitä tämä paketti EI enää käytä:
- npm install --prefix backend
- npm install --prefix frontend
- npx vite
- vite --root

Build tekee näin:
1. npm install
2. node ./node_modules/vite/bin/vite.js build frontend

Backend on tarkistettu:
node --check backend/server.js
