# Kattokartta - iPhone karttakorjaus

Korjattu/parannettu:
- Leaflet-kartalle lisätty automaattinen invalidateSize-korjaus.
- Kartta päivittää kokonsa useamman kerran avauksen, aluevaihdon, aikavalinnan ja paneelin muutosten jälkeen.
- iPhone Safari / PWA -käytössä harmaaksi jääviä kartta-alueita pitäisi tulla selvästi vähemmän.
- Karttatiilille lisätty suurempi keepBuffer.
- CSS:ssä käytetään paremmin mobiiliselainten dvh/svh-korkeuksia.

Render-asetukset:

Build Command:
npm run render-build

Start Command:
npm start
