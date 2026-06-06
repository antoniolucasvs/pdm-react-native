#!/bin/bash

echo "=============================================="
echo "  Iniciando Projeto de Gestao Financeira"
echo "=============================================="
echo ""

# Detect OS to open terminal window
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  echo "[1/2] Iniciando Servidor Backend..."
  osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'/gestao-financeira-api\" && npm install && npm run prisma:migrate && npm run prisma:seed && npm run dev"'
  
  echo "[2/2] Iniciando App Expo..."
  osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'/gestao-financeira\" && npm install && npx expo start --clear"'
else
  # Linux (Ubuntu/Debian style)
  echo "[1/2] Iniciando Servidor Backend..."
  x-terminal-emulator -e bash -c "cd gestao-financeira-api && npm install && npm run prisma:migrate && npm run prisma:seed && npm run dev; exec bash" &
  
  echo "[2/2] Iniciando App Expo..."
  x-terminal-emulator -e bash -c "cd gestao-financeira && npm install && npx expo start --clear; exec bash" &
fi

echo ""
echo "=============================================="
echo "  Pronto! Ambas as aplicacoes foram abertas"
echo "  em janelas separadas do terminal."
echo "=============================================="
