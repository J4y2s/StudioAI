@echo off
chcp 65001 >nul
title Studio IA — Démarrage

echo.
echo  ╔══════════════════════════════════════╗
echo  ║         STUDIO IA - Démarrage        ║
echo  ╚══════════════════════════════════════╝
echo.

:: ── Droits administrateur requis ─────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  [INFO] Relancement en mode administrateur...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: ── 1. Vérifier si Docker Desktop est installé ───────────────────────────────
set "DD_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not exist "%DD_EXE%" set "DD_EXE=%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe"

if not exist "%DD_EXE%" (
    echo  [INFO] Docker Desktop n'est pas installé. Téléchargement en cours...
    echo.

    :: Télécharger l'installeur avec PowerShell
    set "INSTALLER=%TEMP%\DockerDesktopInstaller.exe"
    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe' -OutFile '%TEMP%\DockerDesktopInstaller.exe' -UseBasicParsing }"

    if not exist "%TEMP%\DockerDesktopInstaller.exe" (
        echo  [ERREUR] Échec du téléchargement.
        echo  Vérifiez votre connexion internet et réessayez.
        pause
        exit /b 1
    )

    echo  [INFO] Installation de Docker Desktop (cela peut prendre quelques minutes)...
    echo  [INFO] Suivez les instructions à l'écran si une fenêtre s'ouvre.
    echo.
    "%TEMP%\DockerDesktopInstaller.exe" install --quiet --accept-license

    if %errorlevel% neq 0 (
        echo.
        echo  [ERREUR] L'installation a échoué.
        echo  Essayez d'installer Docker Desktop manuellement :
        echo  https://www.docker.com/products/docker-desktop
        pause
        exit /b 1
    )

    echo  [OK] Docker Desktop installé avec succès.
    echo.

    :: Rafraîchir le path pour trouver docker
    set "DD_EXE=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
    set "PATH=%PATH%;%ProgramFiles%\Docker\Docker\resources\bin;%APPDATA%\Docker\bin"
)

:: ── 2. Lancer Docker Desktop s'il n'est pas démarré ─────────────────────────
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  [INFO] Lancement de Docker Desktop...
    start "" "%DD_EXE%"

    echo  [INFO] Attente du démarrage du moteur Docker
    echo         (peut prendre 30 à 60 secondes au premier lancement)
    echo.
    set /a attempts=0
    :wait_loop
        timeout /t 5 /nobreak >nul
        set /a attempts+=1
        <nul set /p "= ."
        docker info >nul 2>&1
        if %errorlevel% equ 0 goto docker_ready
        if %attempts% geq 36 (
            echo.
            echo  [ERREUR] Docker Desktop n'a pas démarré après 3 minutes.
            echo  Ouvrez Docker Desktop manuellement et relancez ce script.
            pause
            exit /b 1
        )
        goto wait_loop
    :docker_ready
    echo.
    echo  [OK] Docker Desktop est prêt.
) else (
    echo  [OK] Docker Desktop est déjà en cours d'exécution.
)

:: ── 3. Vérifier que docker-compose.yml existe ────────────────────────────────
if not exist "%~dp0docker-compose.yml" (
    echo.
    echo  [ERREUR] docker-compose.yml introuvable.
    echo  Assurez-vous d'exécuter ce fichier depuis le dossier du projet.
    pause
    exit /b 1
)

:: ── 4. Créer .env si absent ──────────────────────────────────────────────────
if not exist "%~dp0.env" (
    echo.
    if exist "%~dp0.env.example" (
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo  [INFO] Fichier .env créé.
        echo.
        echo  ╔══════════════════════════════════════════════════════╗
        echo  ║  IMPORTANT : Configurez vos clés API dans .env       ║
        echo  ║                                                      ║
        echo  ║  OPENROUTER_API_KEY=sk-or-...                        ║
        echo  ║  FAL_API_KEY=fal_...                                 ║
        echo  ╚══════════════════════════════════════════════════════╝
        echo.
        echo  Le fichier .env va s'ouvrir. Renseignez vos clés API,
        echo  sauvegardez (Ctrl+S), fermez le Bloc-notes, puis appuyez sur Entrée.
        echo.
        pause >nul
        notepad "%~dp0.env"
        echo  Appuyez sur Entrée pour continuer...
        pause >nul
    ) else (
        echo  [ERREUR] Fichier .env.example introuvable.
        pause
        exit /b 1
    )
)

:: ── 5. Créer le dossier de données PocketBase ────────────────────────────────
if not exist "%~dp0pocketbase\pb_data" (
    mkdir "%~dp0pocketbase\pb_data"
    echo  [INFO] Dossier pocketbase\pb_data créé.
)

:: ── 6. Démarrer les services ─────────────────────────────────────────────────
echo.
echo  [1/3] Arrêt des anciens conteneurs...
docker compose -f "%~dp0docker-compose.yml" down >nul 2>&1

echo  [2/3] Construction et démarrage des services...
echo        (peut prendre quelques minutes au premier lancement)
echo.
docker compose -f "%~dp0docker-compose.yml" up -d --build

if %errorlevel% neq 0 (
    echo.
    echo  [ERREUR] Échec du démarrage. Logs :
    docker compose -f "%~dp0docker-compose.yml" logs --tail=30
    pause
    exit /b 1
)

echo.
echo  [3/3] Vérification des services...
timeout /t 5 /nobreak >nul
docker compose -f "%~dp0docker-compose.yml" ps

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║              Studio IA est démarré !                 ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║  Application  : http://localhost:3000                ║
echo  ║  PocketBase   : http://localhost:8090/_/             ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Ouverture du navigateur dans 3 secondes...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo  Pour arrêter Studio IA : lancez stop.bat
echo.
pause
