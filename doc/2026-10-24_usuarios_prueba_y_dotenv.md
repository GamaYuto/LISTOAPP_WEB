# Historial de Cambios — Soporte Dotenv Backend y Creación de Usuarios de Prueba

- **Fecha:** 24 de Octubre de 2026
- **Rama:** `dev`
- **Proyecto:** `LISTOAPP_WEB`

---

## 1. Contexto y Problema
Al intentar autenticar o registrar usuarios, Prisma requería explícitamente la variable de entorno `DATABASE_URL`, la cual no estaba siendo cargada en tiempo de ejecución por `dotenv` en el punto de entrada de Express.

---

## 2. Ajustes Realizados

### 2.1. Backend (`backend/src/server.ts`)
- Se configuró la importación y ejecución temprana de `dotenv.config()` para asegurar la inyección de variables de entorno antes de la instanciación de las rutas y del cliente Prisma.

### 2.2. Configuración de Entorno Local (`backend/.env`)
- Se configuró el entorno local con:
  - `PORT=3000`
  - `DATABASE_URL="file:./dev.db"`
  - `JWT_SECRET="listoapp_super_secret_jwt_key_2026"`
- *(El archivo `.env` permanece ignorado por `.gitignore` para seguridad).*

---

## 3. Usuarios de Prueba Creados
Se crearon y validaron exitosamente mediante la API de autenticación (`/api/auth/login`):

1. **Usuario Cliente:**
   - **Correo:** `cliente@listoapp.com`
   - **Contraseña:** `Password123!`
   - **Rol:** `CLIENT`

2. **Usuario Trabajador / Proveedor:**
   - **Correo:** `trabajador@listoapp.com`
   - **Contraseña:** `Password123!`
   - **Rol:** `PROVIDER`
