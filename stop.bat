@echo off
chcp 65001 >nul
title Studio IA — Arrêt

echo.
echo  ╔══════════════════════════════════════╗
echo  ║          STUDIO IA - Arrêt           ║
echo  ╚══════════════════════════════════════╝
echo.

docker compose -f "%~dp0docker-compose.yml" down

echo.
echo  Studio IA est arrêté.
echo.
pause
