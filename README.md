# 🅿️ Sistema de Control de Estacionamiento

Sistema web para gestión de plazas, entradas/salidas y tarifas de estacionamiento.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| ORM | Sequelize |
| Base de datos | PostgreSQL |
| Autenticación | JWT + bcrypt |
| Deploy API | Railway |
| Deploy Front | Vercel / Netlify |

## Requisitos previos

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL >= 14

## Instalación

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/Salmon5g/Proyecto-final-.web.git
cd TU_REPO
\`\`\`

### 2. Instalar dependencias del backend

\`\`\`bash
npm install
\`\`\`

### 3. Instalar dependencias del frontend

\`\`\`bash
cd client
npm install
\`\`\`

## Variables de entorno

Copia `.env.example` como `.env` y rellena los valores:

\`\`\`bash
cp .env.example .env
\`\`\`

Ver `.env.example` para descripción de cada variable.

## Ejecución local

### Backend (desde la raíz)

\`\`\`bash
npm run dev
# API disponible en http://localhost:3000
\`\`\`

### Frontend (desde /client)

\`\`\`bash
cd client
npm run dev
# UI disponible en http://localhost:5173
\`\`\`

## Estructura del proyecto

\`\`\`
proyecto-estacionamiento/
├── client/            # Frontend React
├── src/
│   ├── routes/        # Definición de endpoints
│   ├── controllers/   # Lógica HTTP
│   ├── services/      # Reglas de negocio
│   ├── models/        # Modelos Sequelize
│   ├── middlewares/   # Auth, errores, etc.
│   └── app.js         # Configuración Express
├── migrations/        # Migraciones de BD
├── seeders/           # Datos de prueba
├── postman/           # Colección Postman
├── .env.example       # Variables requeridas
└── README.md
\`\`\`

## API

Prefijo base: `/api/v1`

Verificar que la API funciona:
\`\`\`
GET /api/v1/health
\`\`\`

## Variables de entorno

### En local

Copia el archivo de ejemplo y edítalo con tus datos:

```bash
cp .env.example .env

## Base de datos

Este proyecto usa **MySQL** con Sequelize ORM.

### Comandos de migración

\```bash
# Ejecutar todas las migraciones
npm run db:migrate

# Deshacer todas las migraciones
npm run db:migrate:undo

# Ver estado de migraciones
npm run db:status
\```

## API — Plazas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/v1/plazas`     | Listar todas las plazas |
| GET    | `/api/v1/plazas/:id` | Obtener plaza por ID |
| POST   | `/api/v1/plazas`     | Crear nueva plaza |
| PUT    | `/api/v1/plazas/:id` | Actualizar plaza |
| DELETE | `/api/v1/plazas/:id` | Eliminar plaza |

### Campos de Plaza

| Campo   | Tipo    | Valores posibles                              |
|---------|---------|-----------------------------------------------|
| codigo  | string  | Ej: "A-01", "B-12"                           |
| tipo    | enum    | `normal`, `discapacitado`, `moto`            |
| estado  | enum    | `libre`, `ocupada`, `reservada`, `mantenimiento` |
| planta  | integer | Número de planta (default: 1)                |

## API — Registros (Estacionamiento activo)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/v1/registros`            | Listar todos los registros |
| GET    | `/api/v1/registros/activos`    | Vehículos actualmente estacionados |
| GET    | `/api/v1/registros/:id`        | Obtener registro por ID |
| POST   | `/api/v1/registros/entrada`    | Registrar entrada de vehículo |
| PUT    | `/api/v1/registros/:id/salida` | Registrar salida y calcular importe |
| DELETE | `/api/v1/registros/:id`        | Eliminar registro |

### Lógica de negocio
- Al registrar **entrada**: la plaza pasa a estado `ocupada`
- Al registrar **salida**: se calcula el importe (mínimo 1h a 2.50€/h) y la plaza vuelve a `libre`

---

## CHANGELOG

### v1.1.0 — 2026-06-12

#### AC — Agregar campo `tipo_pago` a `registros`

**Tipo de cambio:** AC (Agregar Campo)

**Qué se agregó:**
- Columna `tipo_pago ENUM('efectivo', 'tarjeta', 'app')` en la tabla `registros`.
- Valor por defecto: `efectivo` (compatibilidad con registros previos).

**Por qué:**
Registrar el método de pago utilizado al cerrar cada estancia permite generar reportes financieros por tipo y dar trazabilidad al operador.

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `src/migrations/20260612000001-add-tipo-pago-to-registros.js` | Nueva migración versionada |
| `src/models/Registro.js` | Campo `tipo_pago` añadido al modelo |
| `src/controllers/registroController.js` | `PUT /registros/:id/salida` acepta y valida `tipo_pago` |

**Endpoint afectado:**
PUT /api/v1/registros/:id/salida
Body: { "tipo_pago": "efectivo" | "tarjeta" | "app" }

- Si se omite → valor por defecto `efectivo`
- Si se envía un valor inválido → `422 Unprocessable Entity`

**Cómo ejecutar la migración:**
npm run db:migrate