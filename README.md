# Kattokartta - kosteusraja 78 %

Muutokset:
- Kosteusraja muutettu 70 prosentista 78 prosenttiin.
- Pinnoituskeli lasketaan nyt hyväksytyksi, kun suhteellinen kosteus on alle 78 %.
- Varoitusalue siirretty aiemmasta 65 % rajasta noin 73 % tuntumaan.
- Backendin syntaksi tarkistettu.
- npm install ja npm run build testattu onnistuneesti.

Huomio 4 h aikaikkunasta:
Tässä perusversiossa kartan vihreä/punainen arvio on pääosin tuntikohtainen.
Varsinainen yhtäjaksoinen 4 tunnin pinnoitusikkunan laskenta oli Pro-testiversiossa, ei tässä perusversiossa.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
