<template>
  <div class="ocupacion-page">
    <div class="page-header">
      <div>
        <h1>📊 Ocupación por Zona</h1>
        <p class="subtitle">Estado actual de plazas agrupado por planta</p>
      </div>
    </div>

    <!-- Filtro por tipo -->
    <div class="filtros">
      <label>Filtrar por tipo de plaza:</label>
      <div class="filter-buttons">
        <button
          v-for="t in tipos"
          :key="t.value"
          :class="['btn-filtro', { active: tipoActivo === t.value }]"
          @click="cambiarTipo(t.value)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Cargando ocupación...</div>

    <!-- Cards por planta -->
    <div v-else-if="datos.length" class="grid-plantas">
      <div v-for="zona in datos" :key="zona.planta" class="card-planta">
        <div class="card-header">
          <span class="planta-titulo">🏢 Planta {{ zona.planta }}</span>
          <span class="total-badge">{{ zona.total }} plazas</span>
        </div>

        <!-- Barra de ocupación -->
        <div class="barra-container">
          <div
            class="barra-ocupada"
            :style="{ width: pctOcupada(zona) + '%' }"
            :title="`${pctOcupada(zona)}% ocupado`"
          ></div>
        </div>
        <p class="pct-texto">{{ pctOcupada(zona) }}% ocupado</p>

        <!-- Contadores -->
        <div class="contadores">
          <div class="contador libre">
            <span class="num">{{ zona.libre }}</span>
            <span class="lbl">Libre</span>
          </div>
          <div class="contador ocupada">
            <span class="num">{{ zona.ocupada }}</span>
            <span class="lbl">Ocupada</span>
          </div>
          <div class="contador reservada">
            <span class="num">{{ zona.reservada }}</span>
            <span class="lbl">Reservada</span>
          </div>
          <div class="contador mantenimiento">
            <span class="num">{{ zona.mantenimiento }}</span>
            <span class="lbl">Mantenim.</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No hay plazas registradas para mostrar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const config = useRuntimeConfig()
const API = config.public.apiUrl

const datos      = ref([])
const loading    = ref(false)
const error      = ref('')
const tipoActivo = ref('')

const tipos = [
  { value: '',              label: 'Todos' },
  { value: 'normal',        label: '🚗 Normal' },
  { value: 'discapacitado', label: '♿ Discapacitado' },
  { value: 'moto',          label: '🏍️ Moto' },
]

const headers = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

async function cargarOcupacion() {
  loading.value = true
  error.value   = ''
  try {
    const url = tipoActivo.value
      ? `${API}/plazas/ocupacion?tipo=${tipoActivo.value}`
      : `${API}/plazas/ocupacion`

    const res  = await fetch(url, { headers: headers() })
    const data = await res.json()

    if (data.ok) datos.value = data.data
    else error.value = data.message
  } catch {
    error.value = 'Error al cargar la ocupación.'
  } finally {
    loading.value = false
  }
}

function cambiarTipo(tipo) {
  tipoActivo.value = tipo
  cargarOcupacion()
}

function pctOcupada(zona) {
  if (!zona.total || zona.total == 0) return 0
  return Math.round((zona.ocupada / zona.total) * 100)
}

onMounted(cargarOcupacion)
</script>

<style scoped>
.ocupacion-page { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem; }

.page-header { margin-bottom: 1.5rem; }
.page-header h1 { margin: 0 0 0.25rem; font-size: 1.8rem; }
.subtitle { color: #6b7280; margin: 0; }

/* Filtros */
.filtros { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.filtros label { font-weight: 500; color: #374151; }
.filter-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.btn-filtro {
  padding: 0.4rem 1rem; border: 2px solid #d1d5db; border-radius: 999px;
  background: white; cursor: pointer; font-size: 0.88rem; color: #374151;
  transition: all 0.2s;
}
.btn-filtro.active { border-color: #2563eb; background: #2563eb; color: white; font-weight: 600; }
.btn-filtro:hover:not(.active) { border-color: #93c5fd; color: #2563eb; }

/* Grid de cards */
.grid-plantas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.card-planta {
  background: white; border-radius: 12px; padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;
}

.card-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
}
.planta-titulo { font-size: 1.1rem; font-weight: 700; color: #1e3a5f; }
.total-badge {
  background: #eff6ff; color: #2563eb;
  font-size: 0.8rem; font-weight: 600;
  padding: 0.2rem 0.6rem; border-radius: 999px;
}

/* Barra */
.barra-container {
  width: 100%; height: 10px; background: #e5e7eb;
  border-radius: 999px; overflow: hidden; margin-bottom: 0.4rem;
}
.barra-ocupada {
  height: 100%; background: #ef4444;
  border-radius: 999px; transition: width 0.4s ease;
}
.pct-texto { font-size: 0.8rem; color: #6b7280; margin: 0 0 1rem; }

/* Contadores */
.contadores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.contador {
  display: flex; flex-direction: column; align-items: center;
  padding: 0.5rem 0.25rem; border-radius: 8px;
}
.contador .num { font-size: 1.4rem; font-weight: 700; }
.contador .lbl { font-size: 0.7rem; color: #6b7280; text-align: center; }
.contador.libre        { background: #dcfce7; }
.contador.libre .num   { color: #16a34a; }
.contador.ocupada      { background: #fee2e2; }
.contador.ocupada .num { color: #dc2626; }
.contador.reservada      { background: #fef9c3; }
.contador.reservada .num { color: #ca8a04; }
.contador.mantenimiento      { background: #f3f4f6; }
.contador.mantenimiento .num { color: #6b7280; }

/* Misc */
.loading { text-align: center; padding: 2rem; color: #6b7280; }
.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
.alert-error { background: #fee2e2; color: #b91c1c; }
.empty-state { text-align: center; padding: 3rem; color: #9ca3af; }
</style>