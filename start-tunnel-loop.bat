@echo off
title InstaDrop Tunnel (AUTO RECONNECT)
color 0A

:loop
cls
echo ====================================================
echo   MENGHUBUNGKAN KE SERVEO (TUNNEL)...
echo   (Jika putus, akan nyambung lagi otomatis)
echo ====================================================
echo.

:: Opsi ServerAliveInterval menjaga koneksi tetap hidup
ssh -o ServerAliveInterval=60 -R 80:localhost:3402 serveo.net

echo.
echo ====================================================
echo [WARNING] KONEKSI TERPUTUS! 
echo Menyambung ulang dalam 3 detik...
echo ====================================================
timeout /t 3 >nul
goto loop
