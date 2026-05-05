@echo off
title Kattokartta Render-valmis paikallinen testi
cd /d "%~dp0"
echo.
echo Asennetaan backend ja frontend paketit...
call npm run install:all
echo.
echo Rakennetaan frontend...
call npm run build
echo.
echo Kaynnistetaan yksi palvelin osoitteessa http://localhost:3001
echo.
call npm start
pause
