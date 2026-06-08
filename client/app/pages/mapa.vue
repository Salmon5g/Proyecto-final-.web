<template>
  <div class="mapa-page">
    <div class="page-header">
      <div>
        <h1>🗺️ Mapa de Plazas</h1>
        <p class="subtitle">Vista general del estacionamiento por planta</p>
      </div>
      <button class="btn btn-outline" @click="cargarPlazas">🔄 Actualizar</button>
    </div>

    <!-- Leyenda -->
    <div class="leyenda">
      <span v-for="e in estados" :key="e.value" class="leyenda-item">
        <span :class="['dot', e.value]"></span> {{ e.label }}
      </span>
    </div>

    <!-- Filtros -->
    <div class="filtros">
      <div class="filtro-grupo">
        <label>Planta:</label>
        <div class="filter-buttons">
          <button
            v-for="p in plantasDisponibles"
            :key="p"
            :class="['btn-filtro', { active: plantaActiva === p }]"
            @click="plantaActiva = p"
          >
            {{ p === 'todas' ? 'Todas' : `Planta ${p}` }}
          </button>
        </div>
      </div>
      <div class="filtro-grupo">
        <label>Tipo:</label>
        <div class="filter-buttons">
          <button
            v-for="t in tipos"
            :key="t.value"
            :class="['btn-filtro', { active: tipoActivo === t.value }]"
            @click="tipoActivo = t.value"
          >
            {{ t.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error / Loading -->
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="loading" class="loading">Cargando mapa...</div>

    <!-- Mapa por planta -->
    <div v-else>
      <div v-for="planta in plantasMostradas" :key="planta" class="bloque-planta">
        <div class="planta-header">
          <h2>🏢 Planta {{ planta }}</h2>
          <div class="planta-stats">
            <span class="stat libre">{{ contarEstado(planta, 'libre') }} libres</span>
            <span class="stat ocupada">{{ contarEstado(planta, 'ocupada') }} ocupadas</span>
            <span class="stat reservada">{{ contarEstado(planta, 'reservada') }} reservadas</span>
            <span class="stat mantenimiento">{{ contarEstado(planta, 'mantenimiento') }} mant.</span>
          </div>
        </div>

        <div class="grid-plazas">
          <div
            v-for="plaza in plazasDePlanta(planta)"
            :key="plaza.id"
            :class="['plaza-card', plaza.estado]"
            @click="abrirModal(plaza)"
            :title="`${plaza.codigo} — ${plaza.estado}`"
          >
            <span class="plaza-codigo">{{ plaza.codigo }}</span>
            <span class="plaza-tipo">{{ iconTipo(plaza.tipo) }}</span>
            <span class="plaza-estado-lbl">{{ plaza.estado }}</span>
          </div>
        </div>
      </div>

      <div v-if="!plantasMostradas.length" class="empty-state">
        No hay plazas que coincidan con los filtros.
      </div>
    </div>

    <!-- Modal cambiar estado -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <h2>✏️ Plaza {{ plazaSeleccionada?.codigo }}</h2>
        <p class="modal-meta">
          Tipo: <strong>{{ plazaSeleccionada?.tipo }}</strong> &nbsp;|&nbsp;
          Planta: <strong>{{ plazaSeleccionada?.planta }}</strong>
        </p>

        <div class="form-group">
          <label>Cambiar estado:</label>
          <div class="estado-opciones">
            <button
              v-for="e in estados"
              :key="e.value"
              :class="['btn-estado', e.value, { active: nuevoEstado === e.value }]"
              @click="nuevoEstado = e.value"
            >
              {{ e.label }}
            </button>
          </div>
        </div>

        <div v-if="modalError" class="alert alert-error">{{ modalError }}</div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primary" :disabled="guardando || nuevoEstado === plazaSeleccionada?.estado" @click="guardarEstado">
            {{ guardando ? 'Guardando...' : '💾 Guardar' }}
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

const plazas          = ref([])
const loading         = ref(false)
const error           = ref('')
const plantaActiva    = ref('todas')
const tipoActivo      = ref('')
const modalVisible    = ref(false)
const plazaSeleccionada = ref(null)
const nuevoEstado     = ref('')
const guardando       = ref(false)
const modalError      = ref('')

const estados = [
  { value: 'libre',         label: '🟢 Libre' },
  { value: 'ocupada',       label: '🔴 Ocupada' },
  { value: 'reservada',     label: '🟡 Reservada' },
  { value: 'mantenimiento', label: '⚫ Mantenimiento' },
]

const tipos = [
  { value: '',              label: 'Todos' },
  { value: 'normal',        label: '🚗 Normal' },
  { value: 'discapacitado', label: '♿ Discapacitado' },
  { value: 'moto',          label: '🏍️ Moto' },
]

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

// ── Fetch ────────────────────────────────────────────────────
async function cargarPlazas() {
  loading.value = true
  error.value = ''
  try {
    const res  = await fetch(`${API}/plazas`, { headers: headers() })
    const data = await res.json()
    if (data.ok) plazas.value = data.data
    else error.value = data.message
  } catch {
    error.value = 'Error al cargar las plazas.'
  } finally {
    loading.value = false
  }
}

// ── Computed ─────────────────────────────────────────────────
const plantasDisponibles = computed(() => {
  const nums = [...new Set(plazas.value.map(p => p.planta))].sort((a, b) => a - b)
  return ['todas', ...nums]
})

const plazasFiltradas = computed(() => {
  return plazas.value.filter(p => {
    const porTipo   = tipoActivo.value   ? p.tipo   === tipoActivo.value   : true
    const porPlanta = plantaActiva.value !== 'todas' ? p.planta === plantaActiva.value : true
    return porTipo && porPlanta
  })
})

const plantasMostradas = computed(() => {
  return [...new Set(plazasFiltradas.value.map(p => p.planta))].sort((a, b) => a - b)
})

function plazasDePlanta(planta) {
  return plazasFiltradas.value.filter(p => p.planta === planta)
}

function contarEstado(planta, estado) {
  return plazasDePlanta(planta).filter(p => p.estado === estado).length
}

function iconTipo(tipo) {
  return { normal: '🚗', discapacitado: '♿', moto: '🏍️' }[tipo] ?? '🚗'
}

// ── Modal ────────────────────────────────────────────────────
function abrirModal(plaza) {
  plazaSeleccionada.value = plaza
  nuevoEstado.value = plaza.estado
  modalError.value = ''
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
  plazaSeleccionada.value = null
  modalError.value = ''
}

async function guardarEstado() {
  guardando.value = true
  modalError.value = ''
  try {
    const res  = await fetch(`${API}/plazas/${plazaSeleccionada.value.id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ estado: nuevoEstado.value }),
    })
    const data = await res.json()
    if (!data.ok) { modalError.value = data.message; return }
    cerrarModal()
    await cargarPlazas()
  } catch {
    modalError.value = 'Error de conexión.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargarPlazas)
</script>

<style scoped>
.mapa-page { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }

.page-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; margin-bottom: 1.25rem;
}
.page-header h1 { margin: 0 0 0.25rem; font-size: 1.8rem; }
.subtitle { color: #6b7280; margin: 0; }

/* Leyenda */
.leyenda { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.leyenda-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.88rem; color: #374151; }
.dot { width: 14px; height: 14px; border-radius: 4px; display: inline-block; }
.dot.libre        { background: #16a34a; }
.dot.ocupada      { background: #dc2626; }
.dot.reservada    { background: #ca8a04; }
.dot.mantenimiento{ background: #9ca3af; }

/* Filtros */
.filtros { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem; }
.filtro-grupo { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.filtro-grupo label { font-weight: 500; font-size: 0.9rem; color: #374151; white-space: nowrap; }
.filter-buttons { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.btn-filtro {
  padding: 0.35rem 0.9rem; border: 2px solid #d1d5db; border-radius: 999px;
  background: white; cursor: pointer; font-size: 0.85rem; color: #374151; transition: all 0.2s;
}
.btn-filtro.active { border-color: #2563eb; background: #2563eb; color: white; font-weight: 600; }
.btn-filtro:hover:not(.active) { border-color: #93c5fd; color: #2563eb; }

/* Bloque por planta */
.bloque-planta { margin-bottom: 2.5rem; }
.planta-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb;
}
.planta-header h2 { font-size: 1.15rem; color: #1e3a5f; margin: 0; }
.planta-stats { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.stat {
  font-size: 0.8rem; font-weight: 600; padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.stat.libre        { background: #dcfce7; color: #16a34a; }
.stat.ocupada      { background: #fee2e2; color: #dc2626; }
.stat.reservada    { background: #fef9c3; color: #ca8a04; }
.stat.mantenimiento{ background: #f3f4f6; color: #6b7280; }

/* Grid de plazas */
.grid-plazas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}

.plaza-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 0.75rem 0.5rem; border-radius: 10px; cursor: pointer;
  border: 2px solid transparent; transition: transform 0.15s, box-shadow 0.15s;
  min-height: 90px; user-select: none;
}
.plaza-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.plaza-card.libre        { background: #dcfce7; border-color: #16a34a; }
.plaza-card.ocupada      { background: #fee2e2; border-color: #dc2626; }
.plaza-card.reservada    { background: #fef9c3; border-color: #ca8a04; }
.plaza-card.mantenimiento{ background: #f3f4f6; border-color: #9ca3af; }

.plaza-codigo { font-weight: 700; font-size: 0.9rem; color: #1f2937; }
.plaza-tipo   { font-size: 1.3rem; margin: 0.2rem 0; }
.plaza-estado-lbl { font-size: 0.7rem; color: #6b7280; text-transform: capitalize; }

/* Botón outline */
.btn { padding: 0.5rem 1.1rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; transition: opacity 0.2s; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline   { background: white; border: 2px solid #d1d5db; color: #374151; }
.btn-outline:hover { border-color: #2563eb; color: #2563eb; }
.btn-primary   { background: #2563eb; color: white; }
.btn-secondary { background: #e5e7eb; color: #374151; }
.btn:hover:not(:disabled) { opacity: 0.85; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
.modal {
  background: white; border-radius: 12px; padding: 2rem;
  width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal h2 { margin: 0 0 0.4rem; font-size: 1.2rem; }
.modal-meta { color: #6b7280; font-size: 0.88rem; margin-bottom: 1.25rem; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 500; margin-bottom: 0.6rem; font-size: 0.9rem; }
.estado-opciones { display: flex; flex-direction: column; gap: 0.5rem; }
.btn-estado {
  padding: 0.5rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px;
  background: white; cursor: pointer; font-size: 0.9rem; text-align: left; transition: all 0.15s;
}
.btn-estado.active.libre        { border-color: #16a34a; background: #dcfce7; }
.btn-estado.active.ocupada      { border-color: #dc2626; background: #fee2e2; }
.btn-estado.active.reservada    { border-color: #ca8a04; background: #fef9c3; }
.btn-estado.active.mantenimiento{ border-color: #9ca3af; background: #f3f4f6; }

.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
.alert-error { background: #fee2e2; color: #b91c1c; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }

.loading { text-align: center; padding: 2rem; color: #6b7280; }
.empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
</style>