#!/usr/bin/env bash
set -euo pipefail

# Simple one-shot setup and launcher for the app.
# Usage: ./run.sh [ios|android|web|start]
#  - ios:     start dev server and open iOS simulator (if available)
#  - android: start dev server and open Android emulator (if available)
#  - web:     start dev server for web (may not support camera fully)
#  - start:   start dev server only (default)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Checking Node and npm..."
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed. Please install Node.js 18 or 20 and re-run." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not available. Please install npm and re-run." >&2
  exit 1
fi

echo "==> Installing dependencies (this may take a minute)..."
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm i --no-audit --no-fund
fi

PLATFORM="${1:-auto}"

echo "==> Starting Expo dev server..."
case "$PLATFORM" in
  ios)
    # Open iOS simulator if available
    if command -v xcrun >/dev/null 2>&1; then
      npx expo start --ios -c
    else
      echo "xcrun not found; launching dev server only." >&2
      npx expo start -c
    fi
    ;;
  android)
    # Open Android emulator if available
    if command -v adb >/dev/null 2>&1 || command -v emulator >/dev/null 2>&1; then
      npx expo start --android -c
    else
      echo "Android SDK tools not found; launching dev server only." >&2
      npx expo start -c
    fi
    ;;
  web)
    npx expo start --web -c
    ;;
  start|auto|*)
    # If on macOS and xcrun available, prefer iOS simulator automatically
    if [[ "$(uname -s)" == "Darwin" ]] && command -v xcrun >/dev/null 2>&1; then
      npx expo start --ios -c
    else
      npx expo start -c
    fi
    ;;
esac


