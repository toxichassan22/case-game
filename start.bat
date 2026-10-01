@echo off
SETLOCAL EnableDelayedExpansion
chcp 65001 >nul

echo.
echo =========================================
echo   TRINITY INVESTIGATION SYSTEM - BOOT
echo =========================================
echo.

:: Check for node_modules in server
if not exist "server\node_modules" (
    echo [SYS] Installing server dependencies...
    cd server && call npm install && cd ..
)

:: Check for node_modules in frontend
if not exist "frontend\node_modules" (
    echo [SYS] Installing frontend dependencies...
    cd frontend && call npm install && cd ..
)

:: Check for node_modules in root (for concurrently)
if not exist "node_modules" (
    echo [SYS] Installing root dependencies...
    call npm install
)

echo [SYS] Clearing ports 3001 and 5173...
for %%p in (3001 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p " 2^>nul') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo [SYS] Starting Trinity Unified Investigation System...
call npm start

echo.
echo =========================================
echo   SYSTEM TERMINATED OR CLOSED.
echo =========================================
pause
