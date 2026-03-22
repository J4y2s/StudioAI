@echo off
title Studio IA - Demarrage

echo.
echo  =========================================
echo       STUDIO IA - Demarrage
echo  =========================================
echo.

:: Droits administrateur requis
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  [INFO] Relancement en mode administrateur...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: -----------------------------------------------------------------
:: 1. Verifier si Docker Desktop est installe
:: -----------------------------------------------------------------
set "DD_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not exist "%DD_EXE%" (
    set "DD_EXE=%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe"
)

if not exist "%DD_EXE%" (
    echo  [INFO] Docker Desktop non trouve. Telechargement en cours...
    echo.

    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe' -OutFile '%TEMP%\DockerDesktopInstaller.exe' -UseBasicParsing"

    if not exist "%TEMP%\DockerDesktopInstaller.exe" (
        echo  [ERREUR] Echec du telechargement.
        echo  Verifiez votre connexion internet et reessayez.
        pause
        exit /b 1
    )

    echo  [INFO] Installation de Docker Desktop...
    echo  [INFO] Patientez, cela peut prendre quelques minutes.
    echo.
    "%TEMP%\DockerDesktopInstaller.exe" install --quiet --accept-license

    if %errorlevel% neq 0 (
        echo.
        echo  [ERREUR] L'installation a echoue.
        echo  Installez Docker Desktop manuellement :
        echo  https://www.docker.com/products/docker-desktop
        pause
        exit /b 1
    )

    set "DD_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    set "PATH=%PATH%;%ProgramFiles%\Docker\Docker\resources\bin;%APPDATA%\Docker\bin"
    echo  [OK] Docker Desktop installe.
    echo.
)

:: -----------------------------------------------------------------
:: 2. Lancer Docker Desktop si pas encore demarre
:: -----------------------------------------------------------------
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  [INFO] Lancement de Docker Desktop...
    start "" "%DD_EXE%"

    echo  [INFO] Attente du moteur Docker (peut prendre 30 a 60 secondes)...
    set /a attempts=0

    :wait_loop
        timeout /t 5 /nobreak >nul
        set /a attempts+=1
        <nul set /p "=."
        docker info >nul 2>&1
        if %errorlevel% equ 0 goto docker_ready
        if %attempts% geq 36 (
            echo.
            echo  [ERREUR] Docker Desktop n'a pas demarre apres 3 minutes.
            echo  Ouvrez Docker Desktop manuellement puis relancez ce script.
            pause
            exit /b 1
        )
        goto wait_loop

    :docker_ready
    echo.
    echo  [OK] Docker Desktop est pret.
) else (
    echo  [OK] Docker Desktop est deja en cours d'execution.
)

:: -----------------------------------------------------------------
:: 3. Verifier que docker-compose.yml existe
:: -----------------------------------------------------------------
if not exist "%~dp0docker-compose.yml" (
    echo.
    echo  [ERREUR] docker-compose.yml introuvable dans %~dp0
    echo  Executez ce fichier depuis le dossier du projet.
    pause
    exit /b 1
)

:: -----------------------------------------------------------------
:: 4. Creer .env si absent
:: -----------------------------------------------------------------
if not exist "%~dp0.env" (
    echo.
    if exist "%~dp0.env.example" (
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo  [INFO] Fichier .env cree depuis .env.example.
        echo.
        echo  ---------------------------------------------------------
        echo   IMPORTANT : Configurez vos cles API dans .env
        echo   OPENROUTER_API_KEY=sk-or-...
        echo   FAL_API_KEY=fal_...
        echo  ---------------------------------------------------------
        echo.
        echo  Le Bloc-notes va s'ouvrir. Renseignez vos cles,
        echo  sauvegardez (Ctrl+S), fermez, puis appuyez sur Entree.
        pause >nul
        notepad "%~dp0.env"
        echo.
        echo  Appuyez sur Entree pour continuer...
        pause >nul
    ) else (
        echo  [ERREUR] Fichier .env.example introuvable.
        pause
        exit /b 1
    )
)

:: -----------------------------------------------------------------
:: 5. Creer le dossier de donnees PocketBase
:: -----------------------------------------------------------------
if not exist "%~dp0pocketbase\pb_data" (
    mkdir "%~dp0pocketbase\pb_data"
    echo  [INFO] Dossier pocketbase\pb_data cree.
)

:: -----------------------------------------------------------------
:: 6. Demarrer les services
:: -----------------------------------------------------------------
echo.
echo  [1/3] Arret des anciens conteneurs...
docker compose -f "%~dp0docker-compose.yml" down >nul 2>&1

echo  [2/3] Construction et demarrage des services...
echo        (quelques minutes au premier lancement)
echo.
docker compose -f "%~dp0docker-compose.yml" up -d --build

if %errorlevel% neq 0 (
    echo.
    echo  [ERREUR] Echec du demarrage. Logs :
    docker compose -f "%~dp0docker-compose.yml" logs --tail=30
    pause
    exit /b 1
)

echo.
echo  [3/3] Verification des services...
timeout /t 5 /nobreak >nul
docker compose -f "%~dp0docker-compose.yml" ps

echo.
echo  =========================================
echo   Studio IA est demarre !
echo  -----------------------------------------
echo   Application : http://localhost:3000
echo   PocketBase  : http://localhost:8090/_/
echo  =========================================
echo.
echo  Ouverture du navigateur dans 3 secondes...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo  Pour arreter Studio IA : lancez stop.bat
echo.
pause
