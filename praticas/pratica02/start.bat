@echo off
title Iniciar Gestao Financeira
echo ==============================================
echo   Iniciando Projeto de Gestao Financeira
echo ==============================================
echo.

echo [1/2] Iniciando Servidor Backend (gestao-financeira-api)...
start "Gestao Financeira - API Backend" cmd /k "cd gestao-financeira-api && npm install && npm run prisma:migrate && npm run prisma:seed && npm run dev"

echo.
echo [2/2] Iniciando Frontend (gestao-financeira)...
start "Gestao Financeira - App Expo" cmd /k "cd gestao-financeira && npm install && npx expo start --clear"

echo.
echo ==============================================
echo   Pronto! Ambas as aplicacoes foram abertas
echo   em janelas separadas do terminal.
echo ==============================================
pause
