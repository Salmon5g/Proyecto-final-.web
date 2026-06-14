<template>
  <div class="tarifas-page">

    <!-- Encabezado -->
    <div class="page-header">
      <div>
        <h1>🏷️ Tarifas</h1>
        <p class="subtitle">Precios por tipo de plaza del estacionamiento</p>
      </div>
      <button class="btn btn-primary" @click="abrirModalCrear">+ Nueva Tarifa</button>
    </div>

    <!-- Cards resumen por tipo -->
    <div class="tipo-cards">
      <div v-for="tipo in tiposInfo" :key="tipo.value" class="tipo-card" :class="tipo.css">
        <span class="tipo-icon">{{ tipo.icon }}</span>
        <div>
          <p class="tipo-label">{{ tipo.label }}</p>
          <p class="tipo-count">{{ contarPorTipo(tipo.value) }} tarifa{{ contarPorTipo(tipo.value) !== 1 ? 's' : '' }}</p>
        </div>
      </div>
    </div>

    <!-- Error general -->
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Tabla -->
    <div v-if="loading" class="loading">Cargando tarifas…</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo de plaza</th>
            <th class="text-right">Precio / min</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tarifas" :key="t.id">
            <td class="nombre">{{ t.nombre }}</td>
            <td>
              <span class="badge-tipo" :class="badgeTipo(t.tipo_vehiculo)">
                {{ iconTipo(t.tipo_vehiculo) }} {{ t.tipo_vehiculo }}
              </span>
            </td>
            <td class="text-right precio">
              {{ Math.round(Number(t.precio_minuto)).toLocaleString('es-CL') }} CLP/m
            </td>
            <td class="text-center">
              <span class="badge-estado" :class="t.activa ? 'activa' : 'inactiva'">
                {{ t.activa ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td class="text-center acciones">
              <button class="btn btn-sm btn-outline-edit" @click="abrirModalEditar(t)">Editar</button>
              <button class="btn btn-sm btn-outline-del" @click="eliminar(t)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="tarifas.length === 0">
            <td colspan="5" class="empty">No hay tarifas registradas aún.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal crear / editar -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2>{{ modoEdicion ? '✏️ Editar Tarifa' : '➕ Nueva Tarifa' }}</h2>
          <button class="btn-close" @click="cerrarModal">✕</button>
        </div>

        <div class="alert alert-error" v-if="formError">{{ formError }}</div>

        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" type="text" placeholder="Ej: Tarifa Normal Día" />
        </div>
        <div class="form-group">
          <label>Tipo de plaza</label>
          <select v-model="form.tipo_vehiculo">
            <option value="normal">🚗 Normal</option>
            <option value="discapacitado">♿ Discapacitado</option>
            <option value="moto">🏍️ Moto</option>
          </select>
        </div>
        <div class="form-group">
          <label>Precio por minuto (CLP)</label>
          <input v-model.number="form.precio_minuto" type="number" step="1" min="0" placeholder="25" />
        </div>
        <div class="form-check">
          <input v-model="form.activa" type="checkbox" id="chkActiva" />
          <label for="chkActiva">Tarifa activa</label>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primary" @click="guardar" :disabled="guardando">
            {{ guardando ? 'Guardando…' : (modoEdicion ? 'Guardar cambios' : 'Crear tarifa') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const config = useRuntimeConfig()
const API    = config.public.apiUrl

const tarifas        = ref([])
const loading        = ref(true)
const error          = ref('')
const mostrarModal   = ref(false)
const modoEdicion    = ref(false)
const formError      = ref('')
const guardando      = ref(false)
const tarifaEditando = ref(null)

const form = ref({ nombre: '', precio_minuto: '', tipo_vehiculo: 'normal', activa: true })

const tiposInfo = [
  { value: 'normal',        label: 'Normal',        icon: '🚗', css: 'tipo-normal' },
  { value: 'discapacitado', label: 'Discapacitado', icon: '♿', css: 'tipo-disc' },
  { value: 'moto',          label: 'Moto',          icon: '🏍️', css: 'tipo-moto' },
]
const contarPorTipo = (tipo) => tarifas.value.filter(t => t.tipo_vehiculo === tipo).length

const badgeTipo = (tipo) => ({ normal: 'badge-normal', discapacitado: 'badge-disc', moto: 'badge-moto' }[tipo] ?? '')
const iconTipo  = (tipo) => ({ normal: '🚗', discapacitado: '♿', moto: '🏍️' }[tipo] ?? '?')

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

const cargar = async () => {
  loading.value = true
  error.value   = ''
  try {
    const res  = await fetch(`${API}/tarifas`, { headers: headers() })
    const data = await res.json()
    if (data.ok) tarifas.value = data.data
    else error.value = data.message
  } catch {
    error.value = 'Error al conectar con la API'
  } finally {
    loading.value = false
  }
}

const abrirModalCrear = () => {
  modoEdicion.value    = false
  tarifaEditando.value = null
  form.value = { nombre: '', precio_minuto: '', tipo_vehiculo: 'normal', activa: true }
  formError.value  = ''
  mostrarModal.value = true
}

const abrirModalEditar = (t) => {
  modoEdicion.value    = true
  tarifaEditando.value = t
  form.value = { nombre: t.nombre, precio_minuto: t.precio_minuto, tipo_vehiculo: t.tipo_vehiculo, activa: t.activa }
  formError.value  = ''
  mostrarModal.value = true
}

const cerrarModal = () => { mostrarModal.value = false }

const guardar = async () => {
  formError.value = ''
  if (!form.value.nombre || !form.value.precio_minuto) {
    formError.value = 'Nombre y precio son obligatorios'; return
  }
  guardando.value = true
  try {
    const url    = modoEdicion.value ? `${API}/tarifas/${tarifaEditando.value.id}` : `${API}/tarifas`
    const method = modoEdicion.value ? 'PUT' : 'POST'
    const res    = await fetch(url, { method, headers: headers(), body: JSON.stringify(form.value) })
    const data   = await res.json()
    if (!data.ok) { formError.value = data.message; return }
    cerrarModal()
    await cargar()
  } catch {
    formError.value = 'Error al conectar con la API'
  } finally {
    guardando.value = false
  }
}

const eliminar = async (t) => {
  if (!confirm(`¿Eliminar la tarifa "${t.nombre}"?`)) return
  try {
    const res  = await fetch(`${API}/tarifas/${t.id}`, { method: 'DELETE', headers: headers() })
    const data = await res.json()
    if (data.ok) await cargar()
    else error.value = data.message
  } catch {
    error.value = 'Error al conectar con la API'
  }
}

onMounted(cargar)
</script>

<style scoped>
.tarifas-page { max-width: 960px; margin: 0 auto; padding: 2rem 1rem; }

.page-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 1.75rem;
}
.page-header h1 { margin: 0 0 0.25rem; font-size: 1.8rem; }
.subtitle { color: #6b7280; margin: 0; font-size: 0.95rem; }

.tipo-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.75rem; }
.tipo-card {
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid transparent;
}
.tipo-icon { font-size: 2rem; line-height: 1; }
.tipo-label { margin: 0; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.tipo-count { margin: 0.15rem 0 0; font-size: 1.1rem; font-weight: 700; color: #1f2937; }

.tipo-normal { background: #eff6ff; border-color: #bfdbfe; }
.tipo-normal .tipo-label { color: #2563eb; }
.tipo-disc   { background: #f5f3ff; border-color: #ddd6fe; }
.tipo-disc   .tipo-label { color: #7c3aed; }
.tipo-moto   { background: #fffbeb; border-color: #fde68a; }
.tipo-moto   .tipo-label { color: #d97706; }

.table-wrapper { background: white; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); overflow: hidden; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th {
  background: #f9fafb; padding: 0.8rem 1.1rem;
  text-align: left; font-weight: 600; font-size: 0.8rem;
  text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280;
}
td { padding: 0.85rem 1.1rem; border-top: 1px solid #f3f4f6; vertical-align: middle; }
tr:hover td { background: #fafafa; }
.nombre { font-weight: 600; color: #111827; }
.precio { font-family: monospace; font-size: 0.95rem; color: #374151; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.empty { text-align: center; padding: 3rem; color: #9ca3af; }

.badge-tipo {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.25rem 0.75rem; border-radius: 999px;
  font-size: 0.8rem; font-weight: 600;
}
.badge-normal { background: #dbeafe; color: #1d4ed8; }
.badge-disc   { background: #ede9fe; color: #6d28d9; }
.badge-moto   { background: #fef3c7; color: #b45309; }

.badge-estado {
  display: inline-block; padding: 0.25rem 0.75rem;
  border-radius: 999px; font-size: 0.8rem; font-weight: 600;
}
.badge-estado.activa   { background: #dcfce7; color: #16a34a; }
.badge-estado.inactiva { background: #f3f4f6; color: #6b7280; }

.acciones { display: flex; gap: 0.4rem; justify-content: center; }
.btn-outline-edit {
  border: 1px solid #93c5fd; color: #2563eb; background: transparent;
  padding: 0.28rem 0.7rem; border-radius: 6px; font-size: 0.82rem;
  cursor: pointer; font-weight: 500; transition: background 0.15s;
}
.btn-outline-edit:hover { background: #eff6ff; }
.btn-outline-del {
  border: 1px solid #fca5a5; color: #dc2626; background: transparent;
  padding: 0.28rem 0.7rem; border-radius: 6px; font-size: 0.82rem;
  cursor: pointer; font-weight: 500; transition: background 0.15s;
}
.btn-outline-del:hover { background: #fef2f2; }

.btn {
  padding: 0.5rem 1.1rem; border: none; border-radius: 8px;
  cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: opacity 0.2s;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary   { background: #2563eb; color: white; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn:hover:not(:disabled) { opacity: 0.85; }
.btn-sm { padding: 0.3rem 0.75rem; font-size: 0.82rem; }

.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
.alert-error { background: #fee2e2; color: #b91c1c; }
.loading { text-align: center; padding: 2rem; color: #6b7280; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
.modal-box {
  background: white; border-radius: 14px; padding: 2rem;
  width: 100%; max-width: 460px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 1.25rem;
}
.modal-header h2 { margin: 0; font-size: 1.2rem; }
.btn-close {
  background: none; border: none; font-size: 1.1rem;
  cursor: pointer; color: #9ca3af; line-height: 1;
}
.btn-close:hover { color: #374151; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 500; font-size: 0.88rem; margin-bottom: 0.4rem; color: #374151; }
.form-group input,
.form-group select {
  width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #d1d5db;
  border-radius: 8px; font-size: 0.9rem; box-sizing: border-box; background: white;
}
.form-group input:focus,
.form-group select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

.form-check { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; }
.form-check input { width: 16px; height: 16px; cursor: pointer; }
.form-check label { font-size: 0.9rem; cursor: pointer; }

.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

@media (max-width: 640px) {
  .tipo-cards { grid-template-columns: 1fr; }
}
</style>