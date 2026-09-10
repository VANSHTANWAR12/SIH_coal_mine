@echo off
echo ===================================================
echo     Starting CoalGuard Local Development Server
echo ===================================================

echo.
echo [1] Starting Node.js Backend API (Port 3001)...
start "CoalGuard Backend" cmd /c "cd backend && npm install && npm start"

echo.
echo [2] Starting Python AI Engine (Port 8000)...
start "CoalGuard AI Engine" cmd /c "cd ai-engine && pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo [3] Starting Frontend via Vercel CLI...
echo NOTE: Make sure you have Vercel CLI installed (npm i -g vercel)
start "CoalGuard Frontend" cmd /k "npx vercel dev --listen 3000"

echo.
echo All services are starting up in separate windows!
echo Frontend will be available at: http://localhost:3000
echo.
pause
