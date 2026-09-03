@echo off
echo ===================================================
echo   BHOOMI CHITRA: National Land Acquisition System
echo ===================================================
echo Starting Unified Server on http://localhost:5000
echo Starting Vite Dev Server on http://localhost:5173
echo.
cd backend
start "BHOOMI CHITRA Backend" node src/index.js
cd ..\frontend
start "BHOOMI CHITRA Frontend" npm run dev
echo.
echo Both servers started!
echo Open your browser at: http://localhost:5173
pause
