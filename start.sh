#!/bin/bash

echo "──────────────────────────────────────────────────────────"
echo "   TRINITY INVESTIGATION SYSTEM : BOOT SEQUENCE"
echo "──────────────────────────────────────────────────────────"

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "[SYS] Terminating all services..."
    kill $(jobs -p)
    exit
}

trap cleanup SIGINT SIGTERM

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "[SYS] Installing server dependencies..."
    (cd server && npm install)
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "[SYS] Installing frontend dependencies..."
    (cd frontend && npm install)
fi

if [ ! -d "node_modules" ]; then
    echo "[SYS] Installing root dependencies..."
    npm install
fi
# Check if ports 3001 or 5173 are occupied
echo "[SYS] Checking port availability (3001, 5173)..."
for port in 3001 5173; do
    PID=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "[SYS] Port $port is occupied by PID $PID. Attempting to free..."
        kill -9 $PID 2>/dev/null || {
            echo "[ERR] Could not free port $port. Please close it manually and restart."
            exit 1
        }
    fi
done

echo "[SYS] Starting Trinity Unified Investigation System..."
npm start
