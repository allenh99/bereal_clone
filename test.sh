#!/usr/bin/env bash
set -euo pipefail

# Non-interactive test runner: installs deps and runs full automated test suite.

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

echo "==> Running automated test suite..."
export CI=true
export TZ=UTC
npm run test:ci
echo "==> Tests completed successfully."


