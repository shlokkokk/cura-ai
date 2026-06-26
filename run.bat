@echo off
:: To run this script, double-click it in File Explorer or run this command:
:: run.bat
title CURA.AI Launcher
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "run.ps1"
pause
