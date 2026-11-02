#!/usr/bin/env bash
set -e

echo "=== Desplegando ListoApp Frontend (Staging) ==="

# 1. Obtener los últimos cambios de Git
echo "-> Obteniendo últimos cambios de Git (origin/dev2)..."
git pull origin dev2

# 2. Instalar dependencias
echo "-> Instalando dependencias de Node.js..."
npm install || npm install --force

# 3. Compilar aplicación con Vite
echo "-> Compilando frontend (Vite -> dist/)..."
npm run build

# 4. Servir archivos estáticos en segundo plano con PM2
echo "-> Gestionando proceso con PM2 en el puerto 5173..."
APP_NAME="listoapp-frontend"

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  echo "-> Reiniciando instancia existente en PM2: $APP_NAME"
  pm2 restart "$APP_NAME"
else
  echo "-> Iniciando servidor estático SPA en PM2: $APP_NAME (puerto 5173)"
  pm2 serve dist 5173 --spa --name "$APP_NAME"
fi

pm2 save

echo "=== Frontend desplegado exitosamente en http://192.168.1.10:5173 ==="
