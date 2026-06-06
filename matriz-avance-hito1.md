# Matriz de avance — Proyecto final web

**Alumno:** Juan Pablo Saavedra
**Tema # / slug:** Sistema de Control de Estacionamiento  
**Hito:** ☑ 1 — 20% (≥5/23)  ☐ 2 — 40% (≥10/23)  ☐ 3 — 100% (23/23)  
**Fecha:** 31 de mayo de 2026

> No aplica al **hito 0** (inicio). Desde el hito 1 se exige matriz.

Leyenda estado: `pendiente` | `en progreso` | `desarrollado`  
API / WEB: `sí` | `no` | `parcial` | `n/a`

## Requisitos generales

| ID | Título | API | WEB | Estado | Evidencia |
|----|--------|-----|-----|--------|-----------|
| GEN-01 | Estructura y README | sí | n/a | desarrollado | Estructura de carpetas `src/`, `src/app.js`, `src/server.js`, `.gitignore`, `README.md` con instrucciones ejecutables. Commit: `feat(GEN-01)` |
| GEN-02 | Variables de entorno | sí | n/a | desarrollado | `.env.example` con todas las variables comentadas. README actualizado con sección de variables. Commit: `feat(GEN-02)` |
| GEN-03 | BD y migraciones | sí | n/a | desarrollado | Conexión Sequelize + MySQL. 4 migraciones ejecutadas: `usuarios`, `plazas`, `tarifas`, `registros`. Scripts `db:migrate` en `package.json`. Commit: `feat(GEN-03)` |
| GEN-04 | Registro (sign up) | | | pendiente | |
| GEN-05 | Login JWT | | | pendiente | |
| GEN-06 | Middleware auth | | n/a | pendiente | |
| GEN-07 | Restablecer contraseña | | | pendiente | |
| GEN-08 | Errores centralizados | | n/a | pendiente | |
| GEN-09 | CRUD + vistas dominio | | | pendiente | |
| GEN-10 | Validaciones HTTP | | n/a | pendiente | |
| GEN-11 | Postman | | n/a | pendiente | |
| GEN-12 | Evolución esquema | | n/a | pendiente | |
| GEN-13 | Deploy Railway + front | parcial | parcial | en progreso | Backend desplegado en Railway. DB MySQL pendiente de migrar en producción. Frontend no iniciado. |

## Requisitos del dominio

| ID | Título | API | WEB | Estado | Evidencia |
|----|--------|-----|-----|--------|-----------|
| rq-01 | Gestión de plazas | sí | no | desarrollado | Modelo `Plaza.js`, controlador con CRUD completo, rutas REST. Endpoints: `GET /plazas`, `GET /plazas/:id`, `POST /plazas`, `PUT /plazas/:id`, `DELETE /plazas/:id`. Probado en Postman. Commit: `feat(RQ-01)` |
| rq-02 | Registro entrada/salida | sí | no | desarrollado | Modelo `Registro.js`, lógica de negocio: entrada ocupa plaza, salida calcula importe (2.50€/h, mínimo 1h) y libera plaza. Endpoints: `POST /registros/entrada`, `PUT /registros/:id/salida`, `GET /registros/activos`. Probado en Postman. Commit: `feat(RQ-02)` |
| rq-03 | | | | pendiente | |
| rq-04 | | | | pendiente | |
| rq-05 | | | | pendiente | |
| rq-06 | | | | pendiente | |
| rq-07 | | | | pendiente | |
| rq-08 | | | | pendiente | |
| rq-09 | | | | pendiente | |
| rq-10 | | | | pendiente | |

## Resumen

| Métrica | Valor |
|---------|-------|
| Total requisitos | 23 |
| Desarrollados | 5 / 23 |
| Porcentaje | 21.7 % |
| Umbral hito 1 (20%) | ≥ 5 |
| Umbral hito 2 (40%) | ≥ 10 |
| Umbral hito 3 (100%) | 23 |
| ¿Cumple umbral de este hito? | ☑ Sí  ☐ No |

**URLs producción (solo hito 3):**

- API: *(pendiente — Railway en configuración)*
- Front: *(pendiente)*
- Plataforma front: ☐ Railway  ☐ Vercel  ☐ Netlify
