#!/bin/sh
cd "$(dirname "$0")" || exit 1
printf 'Open http://localhost:8000/index.html in your browser.\nPress Ctrl+C to stop.\n'
python3 -m http.server 8000
