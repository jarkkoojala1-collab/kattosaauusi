# Kattokartta - huoltotila kirjautumisella

Lisätty:
- Sivusto on kirjautumisen takana.
- Kirjautumissivu kertoo, että sivusto on huoltotilassa / suljetussa testikäytössä.
- Oletustunnus:
  Käyttäjätunnus: kattosaa
  Salasana: pinnoitus

Renderissä voit vaihtaa tunnukset Environment Variables -kohdassa:

KATTOSAA_USER
KATTOSAA_PASSWORD

Esimerkiksi:
KATTOSAA_USER = omaadmin
KATTOSAA_PASSWORD = vahvasalasana

Tärkeää:
Tämä on kevyt huolto-/testikäyttölukitus. Se ei ole vielä varsinainen yrityskäyttäjien tietoturvamalli tai Supabase/Clerk-kirjautuminen.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
