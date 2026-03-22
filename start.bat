@echo off
chcp 65001 >nul
title Studio IA — Démarrage

echo.
echo  ╔══════════════════════════════════════╗
echo  ║         STUDIO IA - Démarrage        ║
echo  ╚══════════════════════════════════════╝
echo.

:: ── 1. Vérifier que Docker Desktop est installé ──────────────────────────────
set "DD_PATH=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"
if not exist "%DD_PATH%" (
    set "DD_PATH=%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe"
)
if not exist "%DD_PATH%" (
    echo  [ERREUR] Docker Desktop n'est pas installé.
    echo  Téléchargez-le ici : https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

:: ── 2. Lancer Docker Desktop s'il n'est pas déjà démarré ────────────────────
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  [INFO] Lancement de Docker Desktop...
    start "" "%DD_PATH%"

    echo  [INFO] Attente du démarrage de Docker Desktop
    set /a attempts=0
    :wait_loop
        timeout /t 5 /nobreak >nul
        set /a attempts+=1
        docker info >nul 2>&1
        if %errorlevel% equ 0 goto docker_ready
        if %attempts% geq 24 (
            echo.
            echo  [ERREUR] Docker Desktop n'a pas démarré après 2 minutes.
            echo  Vérifiez qu'il se lance correctement, puis réessayez.
            pause
            exit /b 1
        )
        set /p =.< nul
        goto wait_loop
    :docker_ready
    echo.
    echo  [OK] Docker Desktop est prêt.
) else (
    echo  [OK] Docker Desktop est déjà en cours d'exécution.
)

:: ── 3. Vérifier que docker-compose.yml existe ────────────────────────────────
if not exist "%~dp0docker-compose.yml" (
    echo  [ERREUR] docker-compose.yml introuvable.
    echo  Assurez-vous d'exécuter ce fichier depuis le dossier du projet.
    pause
    exit /b 1
)

:: ── 4. Créer .env si absent ──────────────────────────────────────────────────
if not exist "%~dp0.env" (
    echo.
    echo  [INFO] Fichier .env non trouvé.
    if exist "%~dp0.env.example" (
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo  [INFO] Fichier .env créé depuis .env.example.
        echo.
        echo  ╔══════════════════════════════════════════════════════╗
        echo  ║  IMPORTANT : Configurez vos clés API dans .env       ║
        echo  ║  OPENROUTER_API_KEY=sk-or-...                        ║
        echo  ║  FAL_API_KEY=fal_...                                 ║
        echo  ╚══════════════════════════════════════════════════════╝
        echo.
        echo  Le fichier .env va s'ouvrir dans le Bloc-notes.
        echo  Renseignez vos clés API, sauvegardez, puis fermez.
        pause >nul
        notepad "%~dp0.env"
        echo.
        echo  Appuyez sur une touche pour continuer...
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

echo  [2/3] Construction et démarrage (peut prendre quelques minutes au 1er lancement)...
echo.
docker compose -f "%~dp0docker-compose.yml" up -d --build

if %errorlevel% neq 0 (
    echo.
    echo  [ERREUR] Échec du démarrage. Affichage des logs :
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
