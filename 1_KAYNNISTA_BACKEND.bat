@echo off
title Kattokartta Backend
cd /d "%~dp0backend"
echo.
echo Käynnistetään backend...
echo Jos tämä on ensimmäinen kerta, asennetaan tarvittavat paketit.
echo.
call npm install
echo.
echo Backend käynnistyy osoitteessa http://localhost:3001
echo Tätä ikkunaa EI saa sulkea käytön aikana.
echo.
call npm start
pause
