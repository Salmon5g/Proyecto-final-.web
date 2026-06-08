# Matriz de avance — Proyecto final web

**Alumno:** Barsa Lona  
**Tema # / slug:** Sistema de Control de Estacionamiento  
**Hito:** ☑ 1 — 20% (≥5/23)  ☑ 2 — 40% (≥10/23)  ☐ 3 — 100% (23/23)  
**Fecha:** 8 de junio de 2026

> No aplica al **hito 0** (inicio). Desde el hito 1 se exige matriz.

Leyenda estado: `pendiente` | `en progreso` | `desarrollado`  
API / WEB: `sí` | `no` | `parcial` | `n/a`

## Requisitos generales

| ID | Título | API | WEB | Estado | Evidencia |
|----|--------|-----|-----|--------|-----------|
| GEN-01 | Estructura y README | sí | n/a | desarrollado | Estructura de carpetas `src/`, `src/app.js`, `src/server.js`, `.gitignore`, `README.md` con instrucciones ejecutables. Commit: `feat(GEN-01)` |
| GEN-02 | Variables de entorno | sí | n/a | desarrollado | `.env.example` con todas las variables comentadas. README actualizado con sección de variables. Commit: `feat(GEN-02)` |
| GEN-03 | BD y migraciones | sí | n/a | desarrollado | Conexión Sequelize + MySQL. 4 migraciones ejecutadas: `usuarios`, `plazas`, `tarifas`, `registros`. Scripts `db:migrate` en `package.json`. Commit: `feat(GEN-03)` |
| GEN-04 | Registro (sign up) | sí | sí | desarrollado | `POST /api/v1/auth/register` valida email único y contraseña; hash con bcryptjs. `pages/register.vue` con formulario y errores 400/409 visibles en UI. Commit: `feat(GEN-04)` |
| GEN-05 | Login JWT | sí | sí | desarrollado | `POST /api/v1/auth/login` emite JWT (8h, payload: id/nombre/email/rol); 401 con credenciales inválidas. `pages/login.vue` con redirección tras éxito; logout borra token y usuario de localStorage. Commit: `feat(GEN-05)` |
| GEN-06 | Middleware auth | sí | n/a | desarrollado | Middleware `authenticate` en `src/middlewares/auth.js` aplicado a todas las rutas de dominio. Rutas públicas explícitas: `POST /auth/login`, `POST /auth/register`. Token ausente o inválido → 401. Commit: `feat(GEN-06)` |
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
| rq-03 | CRUD recurso principal — Plazas | sí | sí | desarrollado | CRUD completo de plazas en API (`GET/POST/PUT/DELETE /api/v1/plazas`). `pages/plazas.vue` operativa: listado, modal crear/editar, confirmación de eliminar, campos tipo/estado/planta. Commit: `feat(RQ-03)` |
| rq-04 | CRUD recurso secundario — Registros entrada/salida | sí | sí | desarrollado | CRUD completo de registros en API. `pages/registros.vue` operativa: tabs "Todos / Vehículos dentro", registrar entrada (selección de plaza libre), registrar salida, eliminar registro. Commit: `feat(RQ-04)` |
| rq-05 | Regla de negocio — Plaza no puede tener dos vehículos activos | sí | sí | desarrollado | `POST /registros/entrada` verifica `estado === 'ocupada'` → responde 409 con mensaje claro. UI muestra el error en el modal de entrada. Commit: `feat(RQ-05)` |
| rq-06 | Regla de negocio — Calcular tarifa al salir según tiempo estacionado | sí | sí | desarrollado | `PUT /registros/:id/salida` busca tarifa activa en BD según tipo de vehículo (moto/coche/furgoneta), fallback a 2.50€/h. Retorna `horas`, `precio_hora`, `tarifa_nombre`, `importe`. Modal de salida en `pages/registros.vue` muestra ticket con desglose completo. `pages/tarifas.vue` permite gestionar tarifas. Commit: `feat(RQ-06)` |
| rq-07 | Consultas con filtros — Ocupación por zona | sí | sí | desarrollado | `GET /registros/activos` filtra vehículos sin salida. `GET /plazas` expone campo `planta` para agrupar por zona. `pages/registros.vue` tab "Vehículos dentro" con contador; `pages/plazas.vue` muestra estado y planta de cada plaza. Commit: `feat(RQ-07)` |
| rq-08 | Panel principal — Listado de plazas | sí | sí | desarrollado | `GET /plazas` retorna listado completo con id, codigo, tipo, estado, planta. `pages/plazas.vue` muestra tabla con badge visual por estado (libre/ocupada/reservada/mantenimiento) y acciones CRUD inline. Commit: `feat(RQ-08)` |
| rq-09 | | | | pendiente | |
| rq-10 | | | | pendiente | |

## Resumen

| Métrica | Valor |
|---------|-------|
| Total requisitos | 23 |
| Desarrollados | 14 / 23 |
| Porcentaje | 60.9 % |
| Umbral hito 1 (20%) | ≥ 5 |
| Umbral hito 2 (40%) | ≥ 10 |
| Umbral hito 3 (100%) | 23 |
| ¿Cumple umbral de este hito? | ☑ Sí  ☐ No |

**URLs producción (solo hito 3):**

- API: *(pendiente — Railway en configuración)*
- Front: *(pendiente)*
- Plataforma front: ☐ Railway  ☐ Vercel  ☐ Netlify
