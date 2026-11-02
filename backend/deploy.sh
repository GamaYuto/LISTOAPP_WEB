#!/usr/bin/env bash
set -e

echo "=== Iniciando despliegue de ListoApp Backend (Staging) ==="

# 1. Obtener los últimos cambios de la rama dev2
echo "-> Obteniendo últimos cambios de Git (origin/dev2)..."
git pull origin dev2

# 2. Instalar dependencias
echo "-> Instalando dependencias de Node.js..."
npm install || npm install --force

# 3. Generar cliente de Prisma
echo "-> Generando cliente de Prisma..."
npx prisma generate

# 4. Compilar código TypeScript a JavaScript
echo "-> Compilando proyecto (TypeScript -> dist/)..."
npm run build

# 5. Iniciar o reiniciar la aplicación con PM2
echo "-> Gestionando proceso con PM2..."
APP_NAME="listoapp-backend"

if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  echo "-> Reiniciando instancia existente en PM2: $APP_NAME"
  pm2 restart "$APP_NAME" --update-env
else
  echo "-> Iniciando nueva instancia en PM2: $APP_NAME"
  pm2 start dist/server.js --name "$APP_NAME"
fi

pm2 save

echo "=== Despliegue completado exitosamente ==="
