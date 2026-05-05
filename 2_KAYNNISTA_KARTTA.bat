@echo off
title Kattokartta Frontend
cd /d "%~dp0frontend"
echo.
echo Käynnistetään karttasovellus...
echo Jos tämä on ensimmäinen kerta, asennetaan tarvittavat paketit.
echo.
call npm install
echo.
echo Kun näet rivin "Network:", avaa se osoite puhelimella.
echo Esimerkiksi http://192.168.1.25:5173
echo.
call npm run dev
pause
