# Historial de Cambios — Integración de Manual de Marca y Red Local

- **Fecha:** 24 de Octubre de 2026
- **Rama:** `dev` / `main`
- **Proyecto:** `LISTOAPP_WEB`

---

## 1. Integración con Google Stitch
- Configuración del servidor MCP de Stitch con la variable `GOOGLE_CLOUD_PROJECT`.
- Exploración y vinculación del proyecto existente en Stitch: **`ListoApp UX/UI Redesign`** (`16814270882710172290`).
- Sincronización y subida de `DESIGN.md` con los tokens actualizados al proyecto de Stitch.

---

## 2. Aplicación del Manual de Marca Oficial

### 2.1. Paleta de Colores
Se actualizaron los tokens de tema en [frontend/src/index.css](file:///e:/PROJECTS/LISTOAPP_WEB/frontend/src/index.css):
- **Azul Principal (`#88C1E0`):** Base de la app, headers, acentos de confianza y contenedor principal del logo.
- **Naranja Acento (`#FFC300`):** Exclusivo para Call-To-Action (CTAs) de acción inmediata (Cotizar ventana, Enviar a WhatsApp, Login) y el check del logo.
- **Gris Oscuro (`#333333`):** Para todo el texto principal y títulos, asegurando contraste y legibilidad.
- **Blanco (`#FFFFFF`):** Fondo principal de pantalla, tarjetas y espacio negativo limpio.

### 2.2. Tipografías
- **Primaria:** `Poppins` (Bold, Semi-Bold, Regular) para encabezados (`h1`-`h6`), botones y el texto "Listo" en el logo.
- **Secundaria:** `Roboto` (Regular, Light) para párrafos, inputs, descripciones y detalles técnicos.
- Cargadas en [frontend/index.html](file:///e:/PROJECTS/LISTOAPP_WEB/frontend/index.html) e inyectadas en las capas `@layer base` de CSS.

### 2.3. Logotipo Oficial y Área de Protección (Sección 3)
- Se creó el componente reutilizable [ListoLogo.tsx](file:///e:/PROJECTS/LISTOAPP_WEB/frontend/src/components/ListoLogo.tsx):
  - Isotipo con base en Azul Principal (`#88C1E0`) y el check en Naranja Acento (`#FFC300`).
  - Margen perimetral obligatorio de seguridad (área de protección).
  - Variantes soportadas: `color`, `monochrome`, `white`.
  - Tamaños normalizados (`sm`, `md`, `lg`, `xl`).
- Aplicado en los componentes públicos principales ([HomePublic.tsx](file:///e:/PROJECTS/LISTOAPP_WEB/frontend/src/components/HomePublic.tsx) y [Login.tsx](file:///e:/PROJECTS/LISTOAPP_WEB/frontend/src/components/Login.tsx)).

---

## 3. Soporte para Acceso desde Red Local (LAN)
Permite conectar cualquier dispositivo (celular, tablet o laptop) en la misma red Wi-Fi:
- **Frontend ([vite.config.ts](file:///e:/PROJECTS/LISTOAPP_WEB/frontend/vite.config.ts)):** Servidor configurado con `host: '0.0.0.0'` en el puerto `5173`.
- **Backend ([backend/src/server.ts](file:///e:/PROJECTS/LISTOAPP_WEB/backend/src/server.ts)):** `app.listen` vinculado a `0.0.0.0` en el puerto `3000`.
- **Servicio API ([api.service.ts](file:///e:/PROJECTS/LISTOAPP_WEB/frontend/src/services/api.service.ts)):** URL base dinámica mediante `window.location.hostname` para enrutar automáticamente las peticiones hacia la IP del servidor en la red local (`http://192.168.0.112:3000/api`).

---

## 4. Control de Versiones (Git y GitHub)
- Creación de `.gitignore` en la raíz del proyecto para salvaguardar `node_modules`, builds y credenciales.
- Creación y publicación de la rama `dev`.
- Merge hacia `main` (`fast-forward`) y sincronización en remoto: [GamaYuto/LISTOAPP_WEB](https://github.com/GamaYuto/LISTOAPP_WEB).
