# Guía de Despliegue de ListoApp Web

Esta guía contiene los pasos y variables de entorno necesarias para desplegar el backend y el frontend en producción, así como instrucciones para correr en modo local.

## Ejecución en Modo Local (Desarrollo)

Si deseas probar la aplicación localmente sin compilarla para producción, puedes usar los scripts de desarrollo:

### Backend Local
1. Abre una terminal y navega a la carpeta `backend`: `cd backend`
2. Asegúrate de tener las dependencias instaladas: `npm install`
3. Ejecuta el servidor en modo desarrollo (se reiniciará automáticamente si haces cambios):
   ```bash
   npm run dev
   ```
   *(El servidor arrancará en `http://localhost:3000`)*

### Frontend Local
1. Abre otra terminal y navega a la carpeta `frontend`: `cd frontend`
2. Instala las dependencias si no lo has hecho: `npm install`
3. Ejecuta el servidor de Vite:
   ```bash
   npm run dev
   ```
   *(Esto abrirá la aplicación web en tu navegador en un puerto local, como `http://localhost:5173`)*

---

## 1. Despliegue del Backend (ej. en Render, Railway, Heroku)

Asegúrate de configurar tu servicio web para ejecutar el siguiente comando de compilación y de arranque:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Variables de Entorno (Backend)
Debes configurar las siguientes variables en el panel de tu proveedor:

- `DATABASE_URL`: Cadena de conexión a tu base de datos PostgreSQL en producción. (Ej: `postgresql://user:password@host:port/dbname?sslmode=require`)
- `JWT_SECRET`: Una clave secreta larga y aleatoria para firmar los tokens JWT. (Ej: `una_clave_muy_segura_y_larga`)
- `PORT`: El puerto donde correrá tu aplicación (Normalmente Render/Heroku lo inyectan automáticamente, pero por defecto será 3000 si no se provee).
- `FRONTEND_URL`: URL de tu frontend en producción para configurar correctamente el CORS y permitir las peticiones (Ej: `https://listoapp-web.vercel.app`). Si se deja vacío, aceptará desde cualquier origen (`*`).

## 2. Despliegue del Frontend (ej. en Vercel, Netlify)

Conecta el repositorio a Vercel o Netlify. El proveedor normalmente detectará que es una aplicación Vite.
- **Build Command**: `npm run build` o `vite build`
- **Publish Directory**: `dist`

### Variables de Entorno (Frontend)
Debes configurar las siguientes variables en el panel de tu proveedor:

- `VITE_API_URL`: La URL pública de tu backend desplegado (la que obtuviste en el paso 1). **Importante:** Debe incluir `/api` al final (Ej: `https://listoapp-backend.onrender.com/api`).

Una vez configuradas estas variables, tus sistemas estarán conectados de manera segura y listos para operar en la nube.
