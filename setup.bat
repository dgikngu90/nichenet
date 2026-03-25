@echo off
echo Setting up SafeNiche...

REM Copy environment file
if exist "backend\.env" (
    echo Backend .env already exists
) else (
    copy ".env" "backend\.env"
    echo Copied .env to backend/
)

REM Install dependencies
echo Installing dependencies...
npm install

REM Start PostgreSQL
echo Starting PostgreSQL...
docker-compose up -d

REM Wait for PostgreSQL to be ready
echo Waiting for PostgreSQL...
timeout /t 5 /nobreak >nul

REM Run database migrations
echo Running migrations...
cd backend
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo Migration failed, trying push...
    call npx prisma db push
)

REM Seed database
echo Seeding database...
call npm run db:seed

echo.
echo Setup complete!
echo.
echo Start the application with:
echo   npm run dev
echo.
echo Services:
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:3001
echo   - PostgreSQL: localhost:5432
echo.
echo Demo accounts:
echo   - admin@example.com / password123
echo   - moderator@example.com / password123
echo   - member@example.com / password123
echo.
pause
