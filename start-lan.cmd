@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install the current Node.js LTS and reopen this launcher.
  pause
  exit /b 1
)
if not exist "node_modules\ws\package.json" (
  echo Installing the local LAN signaling dependency...
  call npm install --no-package-lock --ignore-scripts --omit=dev
  if errorlevel 1 (
    echo Dependency installation failed. Check your network and npm configuration.
    pause
    exit /b 1
  )
)
echo.
echo SUPERMAGIC FOOTBALL - LOCAL NETWORK GAME
echo Keep this window open while playing. Open the printed LAN game URL on BOTH devices.
echo Allow inbound TCP port 8000 on private networks if Windows Firewall prompts.
echo.
call npm run serve:lan
echo.
echo LAN server stopped.
pause
