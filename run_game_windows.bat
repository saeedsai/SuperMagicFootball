@echo off
cd /d "%~dp0"
echo Open http://localhost:8000/index.html in your browser.
py -3 -m http.server 8000
pause
