@echo off
echo Membuka Panel Admin Darurat...
cd /d "%~dp0admin-tool"
node backend.cjs
pause
