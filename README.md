# Kattokartta - aluevaihto varma korjaus

Korjattu:
- Aluevaihdossa vanhan alueen pisteet poistetaan välittömästi.
- Kartta keskitetään valitun alueen keskelle.
- Pirkanmaa keskitetään Tampereelle.
- Uusimaa keskitetään Nurmijärvelle.
- Frontend suodattaa pisteet vielä varmistuksena valitun alueen 150 km säteelle.
- Kartta remountataan aluevaihdossa, joten vanha karttakeskitys ei jää päälle.
- Myöhässä palaava vanhan alueen vastaus ei voi jäädä näkyviin.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
