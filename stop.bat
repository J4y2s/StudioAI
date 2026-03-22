@echo off
title Studio IA - Arret

echo.
echo  =========================================
echo       STUDIO IA - Arret
echo  =========================================
echo.

docker compose -f "%~dp0docker-compose.yml" down

echo.
echo  Studio IA est arrete.
echo.
pause
