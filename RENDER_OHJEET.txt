# Kattokartta - sadetutkan kartta ja asetukset korjattu

Korjattu:
- Sadetutkassa ei enää näy isoa vaaleaa suorakulmiota kartan päällä.
- Sadetutkan oma karttapohja täyttää koko näkymän.
- Sadetutkan tiilikerroksistä poistettu bounds-rajaus, joka aiheutti suorakulmaisen laatikon.
- Asetuksista poistettu erillinen Sadetutka-valinta.
- Sadetutkaa ohjataan vain yläpalkin Sadetutka / Pinnoituskartta -napista.
- Sadetutkan aluekohtainen keskitys säilyy:
  - Uusimaa / Etelä-Suomi
  - Pirkanmaa / Tampereen seutu
- Sadetutkan alapalkki säilyy mukana.
- Mobiilioptimoinnit säilyvät mukana.
- Pinnoituskartta toimii edelleen normaalisti.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
