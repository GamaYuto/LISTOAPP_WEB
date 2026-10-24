# Historial de Cambios — Corrección de Error 500 en /api/services

- **Fecha:** 24 de Octubre de 2026
- **Rama:** `dev`
- **Proyecto:** `LISTOAPP_WEB`

---

## 1. Descripción del Error
Al crear una solicitud de servicio (`POST /api/services`), el backend arrojaba:
```
TypeError: Cannot read properties of undefined (reading 'CLIENT')
```
y un error de conexión con SQLite (`SQLITE_ERROR: no such table: main.User`).

---

## 2. Causa Raíz
1. **Transpilación de Enums:** En `service.controller.ts`, la condición evaluaba `user.role !== Role.CLIENT`. Al transpilarse en caliente con `ts-node-dev` en modo `--transpile-only`, el objeto `Role` no se generaba como valor en tiempo de ejecución en CommonJS.
2. **Discrepancia en la ruta de SQLite:** Prisma generó la base de datos con tablas en `backend/prisma/dev.db`, pero el adaptador en `backend/src/lib/prisma.ts` y `.env` buscaban un archivo vacío en `backend/dev.db`.

---

## 3. Solución Implementada
1. **Enums Seguros en Tiempo de Ejecución ([backend/src/types/enums.ts](file:///e:/PROJECTS/LISTOAPP_WEB/backend/src/types/enums.ts)):**
   - Se redefinieron `Role`, `ServiceStatus` y `OfferStatus` como objetos constantes `as const` y tipos asociados, garantizando valores reales en tiempo de ejecución tanto en desarrollo como en producción.
2. **Ruta Robusta de Base de Datos ([backend/src/lib/prisma.ts](file:///e:/PROJECTS/LISTOAPP_WEB/backend/src/lib/prisma.ts)):**
   - Se ajustó la ruta con `path.resolve(__dirname, '../../prisma/dev.db')` para garantizar que el adaptador siempre apunte al SQLite que contiene las tablas creadas.

---

## 4. Validación
- Se ejecutó `POST http://localhost:3000/api/services` con token de cliente: **201 Created**.
- Se verificó `GET http://192.168.0.112:3000/api/services/my-requests`: **200 OK** con la solicitud creada.
