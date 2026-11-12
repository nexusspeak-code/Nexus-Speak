@echo off
echo ============================================================
echo   NexusSpeak - Building Latest App Updates for Vercel...
echo ============================================================
echo.

call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Please check errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo [1/2] Web assets successfully built in 'dist' folder!
echo [2/2] Updating Android assets...

xcopy /E /I /Y dist\* android\app\src\main\assets\www > nul

echo.
echo ============================================================
echo   SUCCESS! All changes are built and ready!
echo ============================================================
echo.
echo If connected to GitHub/Vercel, push your commit or run:
echo   npx vercel --prod
echo.
echo All mobile app users will receive the update automatically!
echo.
pause
