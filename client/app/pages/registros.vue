<template>
  <div class="registros-page">
    <div class="page-header">
      <div>
        <h1>📋 Registros de Entrada/Salida</h1>
        <p class="subtitle">Control de acceso de vehículos al estacionamiento</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalEntrada">
        + Nueva Entrada
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: vistaActiva === 'todos' }]"
        @click="cambiarVista('todos')"
      >
        Todos los registros
      </button>
      <button
        :class="['tab', { active: vistaActiva === 'activos' }]"
        @click="cambiarVista('activos')"
      >
        🟢 Vehículos dentro
        <span v-if="registrosActivos.length" class="badge">{{ registrosActivos.length }}</span>
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Cargando registros...</div>

    <!-- Tabla -->
    <div v-else class="table-wrapper">
      <table v-if="registrosMostrados.length">
        <thead>
          <tr>
            <th>#</th>
            <th>Matrícula</th>
            <th>Plaza</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Importe</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in registrosMostrados" :key="r.id">
            <td>{{ r.id }}</td>
            <td><strong>{{ r.matricula }}</strong></td>
            <td>{{ r.plaza?.codigo ?? '—' }}</td>
            <td>{{ formatFecha(r.entrada) }}</td>
            <td>{{ r.salida ? formatFecha(r.salida) : '—' }}</td>
            <td>{{ r.importe != null ? `${Math.round(Number(r.importe)).toLocaleString('es-CL')} CLP` : '—' }}</td>
            <td>
              <span :class="['badge-estado', r.salida ? 'cerrado' : 'activo']">
                {{ r.salida ? 'Cerrado' : 'Activo' }}
              </span>
            </td>
            <td class="acciones">
              <!-- Línea ~63 del template -->
<button
  v-if="!r.salida"
  class="btn btn-sm btn-warning"
  @click="abrirModalSalida(r)"   
>
  🚪 Salida
</button>
              <button class="btn btn-sm btn-danger" @click="confirmarEliminar(r)">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <p>{{ vistaActiva === 'activos' ? 'No hay vehículos dentro en este momento.' : 'No hay registros aún.' }}</p>
      </div>
    </div>

    <!-- ── Modal Nueva Entrada ── -->
    <div v-if="modalEntrada" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-box">
        <h2>🚗 Registrar Entrada</h2>

        <div class="form-group">
          <label>Matrícula *</label>
          <input
            v-model="form.matricula"
            type="text"
            placeholder="Ej. 1234ABC"
            maxlength="20"
            @input="form.matricula = form.matricula.toUpperCase()"
          />
        </div>

        <div class="form-group">
          <label>Plaza (opcional)</label>
          <select v-model="form.plaza_id">
            <option :value="null">— Sin plaza asignada —</option>
            <option
              v-for="p in plazasLibres"
              :key="p.id"
              :value="p.id"
            >
              {{ p.codigo }} ({{ p.tipo }}, planta {{ p.planta }})
            </option>
          </select>
        </div>

        <div v-if="formError" class="alert alert-error">{{ formError }}</div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primary" :disabled="guardando" @click="registrarEntrada">
            {{ guardando ? 'Registrando...' : '✅ Registrar Entrada' }}
          </button>
        </div>
      </div>
    </div>

  <!-- Modal Salida -->
<div v-if="mostrarModalSalida" class="modal-backdrop-custom" @click.self="cerrarModalSalida">
  <div class="modal-box">

    <!-- Ticket de salida (después de confirmar) -->
    <div v-if="ticketSalida">
      <h5 class="mb-3 text-success">✅ Salida registrada</h5>
      <div class="card bg-light mb-3">
        <div class="card-body">
          <p class="mb-1"><strong>Matrícula:</strong> {{ ticketSalida.matricula }}</p>
          <p class="mb-1"><strong>Tarifa aplicada:</strong> {{ ticketSalida.tarifa_nombre }}</p>
          <p class="mb-1"><strong>Precio/hora:</strong> {{ Math.round(Number(ticketSalida.precio_hora)).toLocaleString('es-CL') }} CLP</p>
          <p class="mb-1"><strong>Horas estacionado:</strong> {{ ticketSalida.horas }} h</p>
          <hr />
          <p class="mb-0 fs-5 fw-bold text-primary">
          Total: {{ Math.round(Number(ticketSalida.importe)).toLocaleString('es-CL') }} CLP
          </p>
        </div>
      </div>
      <div class="text-end">
        <button class="btn btn-success" @click="cerrarModalSalida">Cerrar</button>
      </div>
    </div>

    <!-- Confirmación previa -->
    <div v-else>
      <h5 class="mb-3">Registrar Salida</h5>
      <p>¿Confirmar salida del vehículo
        <strong>{{ registroSalida?.matricula }}</strong>?
      </p>
      <p class="text-muted small">Se calculará el importe según la tarifa activa.</p>
      <div class="alert alert-danger py-2" v-if="errorSalida">{{ errorSalida }}</div>
      <div class="d-flex gap-2 justify-content-end">
        <button class="btn btn-secondary" @click="cerrarModalSalida">Cancelar</button>
        <button class="btn btn-danger" @click="confirmarSalida">Confirmar salida</button>
      </div>
    </div>

  </div>
</div>

    <!-- ── Modal Confirmar Eliminar ── -->
    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal-box modal-sm">
        <h2>⚠️ Eliminar Registro</h2>
        <p>¿Eliminar el registro de <strong>{{ registroSeleccionado?.matricula }}</strong>?</p>
        <p class="hint">Esta acción no se puede deshacer.</p>

        <div v-if="formError" class="alert alert-error">{{ formError }}</div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="modalEliminar = false">Cancelar</button>
          <button class="btn btn-danger" :disabled="guardando" @click="eliminarRegistro">
            {{ guardando ? 'Eliminando...' : '🗑️ Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const config = useRuntimeConfig()
const API = config.public.apiUrl

// ── Estado ──────────────────────────────────────────────────
const registros        = ref([])
const registrosActivos = ref([])
const plazasLibres     = ref([])
const vistaActiva      = ref('todos')
const loading          = ref(false)
const error            = ref('')

const modalEntrada       = ref(false)
const modalSalida        = ref(false)
const modalEliminar      = ref(false)
const registroSeleccionado = ref(null)
const guardando          = ref(false)
const formError          = ref('')

const mostrarModalSalida = ref(false)
const registroSalida     = ref(null)
const errorSalida        = ref('')

const form = ref({ matricula: '', plaza_id: null })

// ── Computed ─────────────────────────────────────────────────
const registrosMostrados = computed(() =>
  vistaActiva.value === 'activos' ? registrosActivos.value : registros.value
)

// ── Auth helper ──────────────────────────────────────────────
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

const ticketSalida = ref(null); // guarda respuesta de salida exitosa

// ── Fetch ────────────────────────────────────────────────────
async function cargarRegistros() {
  loading.value = true
  error.value = ''
  try {
    const [rTodos, rActivos] = await Promise.all([
      fetch(`${API}/registros`, { headers: headers() }),
      fetch(`${API}/registros/activos`, { headers: headers() }),
    ])
    const dTodos   = await rTodos.json()
    const dActivos = await rActivos.json()

    if (dTodos.ok)   registros.value        = dTodos.data
    if (dActivos.ok) registrosActivos.value = dActivos.data
  } catch {
    error.value = 'Error al cargar los registros.'
  } finally {
    loading.value = false
  }
}

async function cargarPlazasLibres() {
  try {
    const res  = await fetch(`${API}/plazas`, { headers: headers() })
    const data = await res.json()
    if (data.ok) {
      plazasLibres.value = data.data.filter(p => p.estado === 'libre')
    }
  } catch {
    // no-op: el select simplemente quedará vacío
  }
}

// ── Modales ──────────────────────────────────────────────────
function abrirModalEntrada() {
  form.value = { matricula: '', plaza_id: null }
  formError.value = ''
  cargarPlazasLibres()
  modalEntrada.value = true
}

// Reemplaza la función confirmarSalida actual por estas dos:

function abrirModalSalida(registro) {
  registroSalida.value = registro
  ticketSalida.value   = null
  errorSalida.value    = ''
  mostrarModalSalida.value = true
}

const confirmarSalida = async () => {
  if (!registroSalida.value) return
  errorSalida.value = ''
  try {
    const res  = await fetch(`${API}/registros/${registroSalida.value.id}/salida`, {
      method: 'PUT', headers: headers(),
    })
    const data = await res.json()
    if (!data.ok) { errorSalida.value = data.message; return }
    ticketSalida.value = data.data
    await cargarRegistros()
  } catch {
    errorSalida.value = 'Error al conectar con la API'
  }
}

// Cerrar modal de salida limpiando el ticket
const cerrarModalSalida = () => {
  mostrarModalSalida.value = false;
  registroSalida.value = null;
  ticketSalida.value = null;
  errorSalida.value = '';
};
function confirmarEliminar(registro) {
  registroSeleccionado.value = registro
  formError.value = ''
  modalEliminar.value = true
}

function cerrarModal() {
  modalEntrada.value = false
  formError.value = ''
}

// ── Acciones ─────────────────────────────────────────────────
async function registrarEntrada() {
  if (!form.value.matricula.trim()) {
    formError.value = 'La matrícula es obligatoria.'
    return
  }
  guardando.value = true
  formError.value = ''
  try {
    const res  = await fetch(`${API}/registros/entrada`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        matricula: form.value.matricula.trim(),
        plaza_id: form.value.plaza_id || undefined,
      }),
    })
    const data = await res.json()
    if (!data.ok) { formError.value = data.message; return }
    modalEntrada.value = false
    await cargarRegistros()
  } catch {
    formError.value = 'Error de conexión.'
  } finally {
    guardando.value = false
  }
}

async function registrarSalida() {
  guardando.value = true
  formError.value = ''
  try {
    const res  = await fetch(`${API}/registros/${registroSeleccionado.value.id}/salida`, {
      method: 'PUT',
      headers: headers(),
    })
    const data = await res.json()
    if (!data.ok) { formError.value = data.message; return }
    modalSalida.value = false
    await cargarRegistros()
  } catch {
    formError.value = 'Error de conexión.'
  } finally {
    guardando.value = false
  }
}

async function eliminarRegistro() {
  guardando.value = true
  formError.value = ''
  try {
    const res  = await fetch(`${API}/registros/${registroSeleccionado.value.id}`, {
      method: 'DELETE',
      headers: headers(),
    })
    const data = await res.json()
    if (!data.ok) { formError.value = data.message; return }
    modalEliminar.value = false
    await cargarRegistros()
  } catch {
    formError.value = 'Error de conexión.'
  } finally {
    guardando.value = false
  }
}

function cambiarVista(vista) {
  vistaActiva.value = vista
}

// ── Helpers ──────────────────────────────────────────────────
function formatFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

onMounted(cargarRegistros)
</script>

<style scoped>
.registros-page { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }

.page-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 1.5rem;
}
.page-header h1 { margin: 0 0 0.25rem; font-size: 1.8rem; }
.subtitle { color: #6b7280; margin: 0; }

/* Tabs */
.tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb; }
.tab {
  padding: 0.6rem 1.2rem; border: none; background: none;
  cursor: pointer; font-size: 0.95rem; color: #6b7280;
  border-bottom: 2px solid transparent; margin-bottom: -2px;
  transition: color 0.2s, border-color 0.2s;
}
.tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
.tab .badge {
  display: inline-block; background: #2563eb; color: white;
  border-radius: 999px; font-size: 0.75rem;
  padding: 0.1rem 0.5rem; margin-left: 0.4rem;
}

/* Table */
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th { background: #f9fafb; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #374151; }
td { padding: 0.75rem 1rem; border-top: 1px solid #e5e7eb; vertical-align: middle; }
tr:hover td { background: #f9fafb; }

/* Badges estado */
.badge-estado {
  display: inline-block; border-radius: 999px;
  padding: 0.2rem 0.75rem; font-size: 0.8rem; font-weight: 600;
}
.badge-estado.activo  { background: #dcfce7; color: #16a34a; }
.badge-estado.cerrado { background: #f3f4f6; color: #6b7280; }

/* Acciones */
.acciones { display: flex; gap: 0.4rem; }

/* Botones */
.btn {
  padding: 0.5rem 1.1rem; border: none; border-radius: 8px;
  cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: opacity 0.2s;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary   { background: #2563eb; color: white; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn-warning   { background: #f59e0b; color: white; }
.btn-danger    { background: #ef4444; color: white; }
.btn-sm { padding: 0.3rem 0.75rem; font-size: 0.82rem; }
.btn:hover:not(:disabled) { opacity: 0.85; }

/* Empty */
.empty-state { text-align: center; padding: 3rem; color: #9ca3af; font-size: 1rem; }

/* Loading / Error */
.loading { text-align: center; padding: 2rem; color: #6b7280; }
.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
.alert-error { background: #fee2e2; color: #b91c1c; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1060;
}
.modal-box {
  background: white; border-radius: 12px; padding: 2rem;
  width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal-box.modal-sm { max-width: 380px; }
.modal-box h2 { margin: 0 0 1.25rem; font-size: 1.3rem; }
.modal-box p { color: #4b5563; margin: 0.3rem 0; }
.modal-box .hint { font-size: 0.85rem; color: #9ca3af; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 500; margin-bottom: 0.4rem; font-size: 0.9rem; }
.form-group input,
.form-group select {
  width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.9rem; box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus { outline: none; border-color: #2563eb; }

.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
</style>