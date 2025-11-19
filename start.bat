@echo off
echo ========================================
echo   Food Management Platform - Startup
echo ========================================
echo.

:: Check if backend dependencies are installed
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

:: Check if frontend dependencies are installed
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo ========================================
echo   Starting Servers...
echo ========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo ========================================
echo.

:: Start backend in new window
start "Food Management - Backend" cmd /k "cd backend && npm run dev"

:: Wait 3 seconds
timeout /t 3 /nobreak > nul

:: Start frontend in new window
start "Food Management - Frontend" cmd /k "cd frontend && npm run dev"

:: Wait 5 seconds
timeout /t 5 /nobreak > nul

:: Open browser
start http://localhost:3000

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Browser: Opening automatically...
echo.
echo Check the new terminal windows for server logs
echo.
echo To seed database: cd backend && npm run seed
echo.
pause
