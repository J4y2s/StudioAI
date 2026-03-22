@echo off
setlocal enabledelayedexpansion
title Studio IA - Panneau de commande

:main_menu
cls
echo.
echo  =========================================
echo       STUDIO IA - Panneau de commande
echo  =========================================
echo.

:: --- Statut rapide des conteneurs ---
set "status_app=ARRETE"
set "status_pb=ARRETE"
for /f "tokens=*" %%i in ('docker ps --format "{{.Names}}" 2^>nul') do (
    if "%%i"=="studio-ia-app" set "status_app=EN LIGNE"
    if "%%i"=="studio-ia-pb" set "status_pb=EN LIGNE"
)

echo   Application Next.js  :  !status_app!
echo   PocketBase           :  !status_pb!
echo.
echo  -----------------------------------------
echo.
echo   [1]  Demarrer l'application
echo   [2]  Arreter l'application
echo   [3]  Redemarrer l'application
echo   [4]  Reconstruire et redemarrer
echo.
echo   [5]  Voir les logs (Next.js)
echo   [6]  Voir les logs (PocketBase)
echo   [7]  Voir les logs (tous)
echo.
echo   [8]  Ouvrir l'application dans le navigateur
echo   [9]  Ouvrir PocketBase Admin
echo.
echo   [10] Statut detaille des conteneurs
echo   [11] Configurer les cles API (.env)
echo   [12] Nettoyer (supprimer images/volumes)
echo.
echo   [0]  Quitter
echo.
set /p "choice= > Votre choix : "

if "%choice%"=="1"  goto start_app
if "%choice%"=="2"  goto stop_app
if "%choice%"=="3"  goto restart_app
if "%choice%"=="4"  goto rebuild_app
if "%choice%"=="5"  goto logs_next
if "%choice%"=="6"  goto logs_pb
if "%choice%"=="7"  goto logs_all
if "%choice%"=="8"  goto open_app
if "%choice%"=="9"  goto open_pb
if "%choice%"=="10" goto status
if "%choice%"=="11" goto config_env
if "%choice%"=="12" goto clean
if "%choice%"=="0"  goto quit
goto main_menu

:: =================================================================
:start_app
cls
echo.
echo  [Demarrage] Lancement des services...
call :ensure_docker
if errorlevel 1 goto main_menu_pause
docker compose -f "%~dp0docker-compose.yml" up -d
if errorlevel 1 (
    echo  [ERREUR] Echec du demarrage.
    pause & goto main_menu
)
echo.
echo  [OK] Services demarres.
echo   Application : http://localhost:3000
echo   PocketBase  : http://localhost:8090/_/
goto main_menu_pause

:: =================================================================
:stop_app
cls
echo.
echo  [Arret] Arret des services...
docker compose -f "%~dp0docker-compose.yml" down
echo.
echo  [OK] Services arretes.
goto main_menu_pause

:: =================================================================
:restart_app
cls
echo.
echo  [Redemarrage] Redemarrage des services...
call :ensure_docker
if errorlevel 1 goto main_menu_pause
docker compose -f "%~dp0docker-compose.yml" restart
echo.
echo  [OK] Services redemارres.
goto main_menu_pause

:: =================================================================
:rebuild_app
cls
echo.
echo  [Reconstruction] Arret, rebuild et redemarrage...
echo  (Peut prendre plusieurs minutes)
echo.
call :ensure_docker
if errorlevel 1 goto main_menu_pause
docker compose -f "%~dp0docker-compose.yml" down
docker compose -f "%~dp0docker-compose.yml" up -d --build
if errorlevel 1 (
    echo.
    echo  [ERREUR] Echec de la reconstruction.
    pause & goto main_menu
)
echo.
echo  [OK] Application reconstruite et demarree.
goto main_menu_pause

:: =================================================================
:logs_next
cls
echo.
echo  [Logs] Next.js - (Ctrl+C pour quitter les logs)
echo  -------------------------------------------------
docker compose -f "%~dp0docker-compose.yml" logs -f nextjs
goto main_menu_pause

:: =================================================================
:logs_pb
cls
echo.
echo  [Logs] PocketBase - (Ctrl+C pour quitter les logs)
echo  -------------------------------------------------
docker compose -f "%~dp0docker-compose.yml" logs -f pocketbase
goto main_menu_pause

:: =================================================================
:logs_all
cls
echo.
echo  [Logs] Tous les services - (Ctrl+C pour quitter les logs)
echo  -------------------------------------------------
docker compose -f "%~dp0docker-compose.yml" logs -f
goto main_menu_pause

:: =================================================================
:open_app
start http://localhost:3000
goto main_menu

:: =================================================================
:open_pb
start http://localhost:8090/_/
goto main_menu

:: =================================================================
:status
cls
echo.
echo  [Statut] Conteneurs en cours d'execution :
echo  -------------------------------------------------
docker compose -f "%~dp0docker-compose.yml" ps
echo.
echo  [Statut] Ressources utilisees :
echo  -------------------------------------------------
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>nul
goto main_menu_pause

:: =================================================================
:config_env
if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo  [INFO] Fichier .env cree depuis .env.example.
    )
)
notepad "%~dp0.env"
echo.
echo  [INFO] Redemarrage recommande apres modification des cles API.
goto main_menu_pause

:: =================================================================
:clean
cls
echo.
echo  ATTENTION : Cette action supprimera les images Docker
echo  et les volumes non utilises. Les donnees PocketBase
echo  dans pocketbase\pb_data seront conservees.
echo.
set /p "confirm= Confirmer ? (o/N) : "
if /i "%confirm%"=="o" (
    docker compose -f "%~dp0docker-compose.yml" down --rmi local --volumes
    docker system prune -f
    echo.
    echo  [OK] Nettoyage termine.
) else (
    echo  Annule.
)
goto main_menu_pause

:: =================================================================
:quit
echo.
echo  A bientot !
echo.
exit /b 0

:: =================================================================
:main_menu_pause
echo.
pause
goto main_menu

:: =================================================================
:: Sous-routine : s'assurer que Docker est actif
:ensure_docker
docker info >nul 2>&1
if %errorlevel% equ 0 exit /b 0

set "DD_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not exist "%DD_EXE%" set "DD_EXE=%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe"
if not exist "%DD_EXE%" (
    echo.
    echo  [ERREUR] Docker Desktop n'est pas installe.
    echo  Telechargez-le sur : https://www.docker.com/products/docker-desktop
    exit /b 1
)

echo  [INFO] Lancement de Docker Desktop...
start "" "%DD_EXE%"
echo  [INFO] Attente du moteur Docker...
set /a att=0
:ed_loop
timeout /t 5 /nobreak >nul
set /a att+=1
<nul set /p "=."
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo  [OK] Docker pret.
    exit /b 0
)
if %att% lss 36 goto ed_loop
echo.
echo  [ERREUR] Docker n'a pas demarre. Reessayez manuellement.
exit /b 1
