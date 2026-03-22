@echo off
chcp 65001 >nul
title Studio IA — Démarrage

echo.
echo  ╔══════════════════════════════════════╗
echo  ║         STUDIO IA - Démarrage        ║
echo  ╚══════════════════════════════════════╝
echo.

:: Vérifier que Docker est installé
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERREUR] Docker n'est pas installé ou pas dans le PATH.
    echo  Téléchargez Docker Desktop : https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

:: Vérifier que Docker est en cours d'exécution
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERREUR] Docker n'est pas démarré.
    echo  Lancez Docker Desktop et réessayez.
    pause
    exit /b 1
)

:: Vérifier que docker-compose.yml existe
if not exist "%~dp0docker-compose.yml" (
    echo  [ERREUR] docker-compose.yml introuvable.
    echo  Assurez-vous d'exécuter ce fichier depuis le dossier du projet.
    pause
    exit /b 1
)

:: Vérifier que .env existe, sinon copier depuis .env.example
if not exist "%~dp0.env" (
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
        echo  Appuyez sur une touche pour ouvrir .env dans le Bloc-notes...
        pause >nul
        notepad "%~dp0.env"
        echo.
        echo  Appuyez sur une touche pour continuer après avoir sauvegardé .env...
        pause >nul
    ) else (
        echo  [ERREUR] Fichier .env.example introuvable.
        pause
        exit /b 1
    )
)

:: Créer le dossier de données PocketBase si nécessaire
if not exist "%~dp0pocketbase\pb_data" (
    mkdir "%~dp0pocketbase\pb_data"
    echo  [INFO] Dossier pocketbase\pb_data créé.
)

echo  [1/3] Arrêt des anciens conteneurs...
docker compose -f "%~dp0docker-compose.yml" down >nul 2>&1

echo  [2/3] Construction et démarrage des services...
echo.
docker compose -f "%~dp0docker-compose.yml" up -d --build

if %errorlevel% neq 0 (
    echo.
    echo  [ERREUR] Échec du démarrage. Consultez les logs :
    echo  docker compose logs
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

:: Ouvrir le navigateur automatiquement après 3 secondes
echo  Ouverture du navigateur dans 3 secondes...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo  Pour arrêter Studio IA, lancez stop.bat ou tapez :
echo  docker compose down
echo.
pause
