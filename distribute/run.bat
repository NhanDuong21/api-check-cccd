@echo off
REM Start API Check CCCD
REM Change encoding to UTF-8
chcp 65001 > nul

echo.
echo ==========================================
echo   API Check CCCD - Starting...
echo ==========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [ERROR] File .env not found!
    echo Please ensure .env is in the same folder as this batch file.
    echo.
    pause
    exit /b 1
)

REM Get PORT from .env
for /f "tokens=2 delims==" %%i in ('findstr /i "^PORT=" .env') do set PORT=%%i

if "%PORT%"=="" (
    set PORT=8088
)

echo [INFO] Starting API on http://localhost:%PORT%
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Run the executable
api-check-cccd.exe

pause
