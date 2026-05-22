@echo off
REM setup.bat - Windows batch wrapper for setup.sh
REM Run this in Command Prompt or PowerShell if Git Bash is not available

echo ===================================
echo  Environment Setup
echo ===================================
echo.

REM Check if Git Bash is available
where bash >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git Bash not found in PATH.
    echo Please install Git for Windows: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

REM Run the bash setup script
bash scripts/setup.sh

echo.
echo Press any key to exit...
pause >nul
