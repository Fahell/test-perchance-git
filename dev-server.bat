@echo off
REM dev-server.bat - Windows batch wrapper for dev-server.sh

echo ===================================
echo  Local Development Server
echo ===================================
echo.

where bash >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git Bash not found in PATH.
    pause
    exit /b 1
)

bash scripts/dev-server.sh %1

echo.
echo Press any key to exit...
pause >nul
