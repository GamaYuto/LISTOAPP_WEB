name: listoapp-architecture-conventions
description: Regula las convenciones del stack Node.js (TypeScript) + React (Vite) para ListoApp Web.
ListoApp Architecture Conventions
When to use this skill
Al inicializar el backend o frontend desde cero.

Al escribir código en TypeScript para asegurar tipos estrictos.

Al estructurar carpetas y archivos en el proyecto.

How to use it
El agente debe ceñirse estrictamente a las siguientes convenciones:

TypeScript Estricto: Prohibido usar any. Todos los modelos, peticiones y respuestas deben tener interfaces o tipos claros.

Backend (Node.js): Estructura limpia basada en carpetas: /src/controllers, /src/routes, /src/models, /src/middlewares y /src/config. Usar Express con programación asíncrona (async/await) y manejo global de errores.

Frontend (React): Usar Vite como empaquetador, componentes funcionales con Hooks, Tailwind CSS para el estilado (enfoque Mobile-First) y fetch/axios estructurado en servicios separados para las llamadas a la API.

name: listoapp-workflow-states
description: Regula el ciclo de vida y la máquina de estados de las solicitudes y ofertas de limpieza.
ListoApp Workflow & States
When to use this skill
Al diseñar las tablas/migraciones de la base de datos.

Al escribir endpoints que alteren el flujo de negocio (publicar, ofertar, aceptar, completar).

How to use it
El agente debe respetar y validar rigurosamente el siguiente flujo de estados:

ServiceRequests (Solicitudes):

PENDING: Creada por el cliente, visible en el feed para los técnicos.

ACCEPTED: El cliente aceptó la oferta de un técnico. Se bloquea el feed y se abre el chat.

IN_PROGRESS: El técnico inicia el servicio de limpieza en el lugar.

COMPLETED: El técnico finaliza el servicio. Se habilita el flujo de reviews.

CANCELLED: Cancelada por alguna de las partes bajo reglas específicas.

Offers (Ofertas):

PENDING: Enviada por el técnico al cliente.

ACCEPTED: Elegida por el cliente (dispara el cambio del servicio a ACCEPTED).

REJECTED: Ofertas rivales que se descartan automáticamente cuando una es aceptada.