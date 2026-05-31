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