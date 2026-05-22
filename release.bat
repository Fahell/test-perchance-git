@echo off
REM release.bat - Windows batch wrapper for release.sh
REM Usage: release.bat 1.3.0 "feat: description"

echo ===================================
echo  Release Script
echo ===================================
echo.

if "%~1"=="" (
    echo Usage: release.bat ^<version^> ^<description^>
    echo Example: release.bat 1.3.0 "feat: new module"
    echo.
    pause
    exit /b 1
)

where bash >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git Bash not found in PATH.
    pause
    exit /b 1
)

bash scripts/release.sh %1 %2

echo.
echo Press any key to exit...
pause >nul
