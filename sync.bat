@echo off
REM sync.bat - Windows batch wrapper for sync.sh

echo ===================================
echo  Sync with GitHub
echo ===================================
echo.

where bash >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git Bash not found in PATH.
    pause
    exit /b 1
)

bash scripts/sync.sh

echo.
echo Press any key to exit...
pause >nul
