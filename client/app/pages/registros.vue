<template>
    <div class="container py-4">
      <h2 class="mb-4 fw-bold">📋 Registros de Estacionamiento</h2>
  
      <!-- BOTÓN NUEVA ENTRADA -->
      <div class="mb-3">
        <button class="btn btn-primary" @click="abrirModalEntrada">
          ➕ Registrar Entrada
        </button>
      </div>
  
      <!-- TABLA DE REGISTROS -->
      <div class="card shadow-sm">
        <div class="card-body p-0">
          <div v-if="cargando" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Cargando registros…</p>
          </div>
          <div v-else-if="registros.length === 0" class="text-center py-5 text-muted">
            No hay registros aún.
          </div>
          <table v-else class="table table-hover table-striped mb-0 align-middle">
            <thead class="table-dark">
              <tr>
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
              <tr v-for="reg in registros" :key="reg.id">
                <td><code>{{ reg.matricula }}</code></td>
                <!-- ✅ FIX: 'plaza' en minúscula, igual que el alias del backend -->
                <td>{{ reg.plaza?.codigo ?? '—' }}</td>
                <td>{{ formatFecha(reg.entrada) }}</td>
                <td>{{ reg.salida ? formatFecha(reg.salida) : '—' }}</td>
                <td>{{ reg.importe != null ? `$${Number(reg.importe).toLocaleString('es-CL')}` : '—' }}</td>
                <td>
                  <span :class="reg.salida ? 'badge bg-secondary' : 'badge bg-success'">
                    {{ reg.salida ? 'Completado' : 'Activo' }}
                  </span>
                </td>
                <td>
                  <button
                    v-if="!reg.salida"
                    class="btn btn-sm btn-warning"
                    @click="abrirModalSalida(reg)"
                  >
                    🚗 Salida
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- MODAL: REGISTRAR ENTRADA -->
      <div v-if="mostrarModalEntrada" class="modal-overlay" @click.self="cerrarModalEntrada">
        <div class="modal-box shadow-lg">
          <div class="modal-box-header">
            <h5 class="mb-0 fw-bold">🚘 Nueva Entrada</h5>
            <button class="btn-close" @click="cerrarModalEntrada"></button>
          </div>
          <div class="modal-box-body">
  
            <!-- Sin plazas libres -->
            <div v-if="plazasLibres.length === 0" class="alert alert-warning">
              ⚠️ No hay plazas disponibles en este momento.
            </div>
  
            <div v-else>
              <!-- Selección de plaza -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Plaza <span class="text-danger">*</span></label>
                <select v-model="form.plaza_id" class="form-select" @change="onPlazaChange">
                  <option :value="null" disabled>— Selecciona una plaza —</option>
                  <option v-for="p in plazasLibres" :key="p.id" :value="p.id">
                    {{ p.codigo }} — {{ p.tipo }} (Planta {{ p.planta }})
                  </option>
                </select>
              </div>
  
              <!-- Matrícula -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Matrícula <span class="text-danger">*</span></label>
                <!-- ✅ FIX: solo :value + @input, sin v-model (evita conflicto de binding) -->
                <input
                  :value="form.matricula"
                  type="text"
                  class="form-control font-monospace text-uppercase"
                  :placeholder="placeholderMatricula"
                  :maxlength="maxLargoMatricula"
                  :disabled="!form.plaza_id"
                  :class="{ 'bg-light': !form.plaza_id }"
                  @input="handleMatriculaInput"
                />
                <div class="form-text">
                  <span v-if="!form.plaza_id">↑ Selecciona primero una plaza para saber el formato.</span>
                  <span v-else-if="vehiculoEsMoto">
                    Moto: <code>ABC12</code> — 3 letras + 2 dígitos
                  </span>
                  <span v-else>
                    Auto/Discapacitado: <code>AB-CD12</code> — 2 letras, guión, 2 letras, 2 dígitos
                  </span>
                </div>
              </div>
  
              <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            </div>
          </div>
          <div class="modal-box-footer">
            <button class="btn btn-secondary" @click="cerrarModalEntrada">Cancelar</button>
            <button
              class="btn btn-primary"
              :disabled="guardando || plazasLibres.length === 0 || !form.plaza_id"
              @click="registrarEntrada"
            >
              <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
              {{ guardando ? 'Registrando…' : 'Registrar Entrada' }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- MODAL: CONFIRMAR SALIDA / TICKET -->
      <div v-if="mostrarModalSalida" class="modal-overlay" @click.self="cerrarModalSalida">
        <div class="modal-box shadow-lg">
          <div class="modal-box-header">
            <h5 class="mb-0 fw-bold">🅿️ Confirmar Salida</h5>
            <button class="btn-close" @click="cerrarModalSalida"></button>
          </div>
          <div class="modal-box-body">
  
            <!-- Antes de registrar salida -->
            <div v-if="!ticketSalida">
              <p>¿Confirmar salida del vehículo?</p>
              <table class="table table-sm table-bordered">
                <tbody>
                  <tr><th>Matrícula</th><td><code>{{ registroSalida?.matricula }}</code></td></tr>
                  <!-- ✅ FIX: 'plaza' en minúscula -->
                  <tr><th>Plaza</th><td>{{ registroSalida?.plaza?.codigo ?? '—' }}</td></tr>
                  <tr><th>Entrada</th><td>{{ formatFecha(registroSalida?.entrada) }}</td></tr>
                </tbody>
              </table>
              <div v-if="salidaError" class="alert alert-danger py-2">{{ salidaError }}</div>
            </div>
  
            <!-- Ticket de salida -->
            <div v-else class="ticket">
              <div class="ticket-header text-center mb-3">
                <div class="fs-4">🧾</div>
                <div class="fw-bold fs-5">Comprobante de Salida</div>
              </div>
              <table class="table table-sm table-bordered">
                <tbody>
                  <tr><th>Matrícula</th><td><code>{{ ticketSalida.matricula }}</code></td></tr>
                  <!-- ✅ FIX: 'plaza' en minúscula -->
                  <tr><th>Plaza</th><td>{{ ticketSalida.plaza?.codigo ?? '—' }}</td></tr>
                  <tr><th>Entrada</th><td>{{ formatFecha(ticketSalida.entrada) }}</td></tr>
                  <tr><th>Salida</th><td>{{ formatFecha(ticketSalida.salida) }}</td></tr>
                  <tr class="table-primary fw-bold">
                    <th>Total a pagar</th>
                    <td class="fs-5">${{ Number(ticketSalida.importe).toLocaleString('es-CL') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
  
          </div>
          <div class="modal-box-footer">
            <button class="btn btn-secondary" @click="cerrarModalSalida">
              {{ ticketSalida ? 'Cerrar' : 'Cancelar' }}
            </button>
            <button
              v-if="!ticketSalida"
              class="btn btn-warning"
              :disabled="guardando"
              @click="confirmarSalida"
            >
              <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
              {{ guardando ? 'Procesando…' : 'Confirmar Salida' }}
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
  
  const registros    = ref([])
  const plazasLibres = ref([])
  const cargando     = ref(false)
  const guardando    = ref(false)
  const formError    = ref('')
  const salidaError  = ref('')
  
  const mostrarModalEntrada = ref(false)
  const mostrarModalSalida  = ref(false)
  const registroSalida      = ref(null)
  const ticketSalida        = ref(null)
  
  const form = ref({ matricula: '', plaza_id: null })
  
  // ─── Computed ────────────────────────────────────────────────────────────────
  
  const plazaSeleccionada = computed(() =>
    plazasLibres.value.find(p => p.id === form.value.plaza_id) ?? null
  )
  
  const vehiculoEsMoto = computed(() =>
    plazaSeleccionada.value?.tipo?.toLowerCase() === 'moto'
  )
  
  const placeholderMatricula = computed(() => {
    if (!form.value.plaza_id) return 'Selecciona una plaza primero'
    return vehiculoEsMoto.value ? 'ABC12' : 'AB-CD12'
  })
  
  const maxLargoMatricula = computed(() =>
    vehiculoEsMoto.value ? 5 : 7
  )
  
  // ─── Auth helper ─────────────────────────────────────────────────────────────
  
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }
  
  // ─── Data loading ────────────────────────────────────────────────────────────
  
  async function cargarRegistros() {
    cargando.value = true
    try {
      const res = await fetch(`${API}/registros`, { headers: authHeaders() })
      const json = await res.json()
      registros.value = json.data ?? []
    } catch (e) {
      console.error('Error al cargar registros:', e)
    } finally {
      cargando.value = false
    }
  }
  
  async function cargarPlazasLibres() {
    try {
      const res = await fetch(`${API}/plazas`, { headers: authHeaders() })
      const json = await res.json()
      plazasLibres.value = (json.data ?? []).filter(p => p.estado === 'libre')
    } catch (e) {
      console.error('Error al cargar plazas:', e)
    }
  }
  
  // ─── Modal entrada ────────────────────────────────────────────────────────────
  
  async function abrirModalEntrada() {
    form.value = { matricula: '', plaza_id: null }
    formError.value = ''
    await cargarPlazasLibres()
    mostrarModalEntrada.value = true
  }
  
  function cerrarModalEntrada() {
    mostrarModalEntrada.value = false
  }
  
  function onPlazaChange() {
    form.value.matricula = ''
    formError.value = ''
  }
  
  // ─── Matrícula helpers ────────────────────────────────────────────────────────
  
  function handleMatriculaInput(e) {
    // Tomamos solo letras y números, todo en mayúsculas
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  
    if (vehiculoEsMoto.value) {
      // Moto: ABC12 — máximo 5 chars, sin guión
      val = val.slice(0, 5)
    } else {
      // Auto/Discapacitado: AB-CD12 — guión automático después de 2 letras
      val = val.slice(0, 6) // máximo 6 chars alfanuméricos (sin contar el guión)
      if (val.length > 2) {
        val = val.slice(0, 2) + '-' + val.slice(2)
      }
    }
  
    form.value.matricula = val
  
    // Reposicionar el cursor al final (evita que salte al inicio)
    nextTick(() => {
      e.target.value = val
      const pos = val.length
      e.target.setSelectionRange(pos, pos)
    })
  }
  
  function validarMatricula(matricula) {
    if (vehiculoEsMoto.value) {
      return /^[A-Z]{3}\d{2}$/.test(matricula)
    } else {
      return /^[A-Z]{2}-[A-Z]{2}\d{2}$/.test(matricula)
    }
  }
  
  // ─── Registrar entrada ────────────────────────────────────────────────────────
  
  async function registrarEntrada() {
    formError.value = ''
  
    if (!form.value.plaza_id) {
      formError.value = 'Debes seleccionar una plaza.'
      return
    }
  
    if (!validarMatricula(form.value.matricula)) {
      formError.value = vehiculoEsMoto.value
        ? 'Formato inválido. Ejemplo: ABC12'
        : 'Formato inválido. Ejemplo: AB-CD12'
      return
    }
  
    guardando.value = true
    try {
      const res = await fetch(`${API}/registros/entrada`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          matricula: form.value.matricula,
          plaza_id: form.value.plaza_id
        })
      })
      const json = await res.json()
  
      if (!res.ok || !json.ok) {
        formError.value = json.message ?? 'Error al registrar entrada.'
        return
      }
  
      cerrarModalEntrada()
      await cargarRegistros()
    } catch (e) {
      formError.value = 'Error de conexión al servidor.'
    } finally {
      guardando.value = false
    }
  }
  
  // ─── Modal salida ─────────────────────────────────────────────────────────────
  
  function abrirModalSalida(reg) {
    registroSalida.value = reg
    ticketSalida.value = null
    salidaError.value = ''
    mostrarModalSalida.value = true
  }
  
  function cerrarModalSalida() {
    mostrarModalSalida.value = false
    registroSalida.value = null
    ticketSalida.value = null
    salidaError.value = ''
  }
  
  async function confirmarSalida() {
    if (!registroSalida.value) return
    salidaError.value = ''
    guardando.value = true
    try {
      const res = await fetch(`${API}/registros/${registroSalida.value.id}/salida`, {
        method: 'PUT',
        headers: authHeaders()
      })
      const json = await res.json()
  
      if (!res.ok || !json.ok) {
        salidaError.value = json.message ?? 'Error al registrar salida.'
        return
      }
  
      ticketSalida.value = json.data
      await cargarRegistros()
    } catch (e) {
      salidaError.value = 'Error de conexión al servidor.'
    } finally {
      guardando.value = false
    }
  }
  
  // ─── Helpers ──────────────────────────────────────────────────────────────────
  
  function formatFecha(fecha) {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  }
  
  // ─── Init ─────────────────────────────────────────────────────────────────────
  
  onMounted(cargarRegistros)
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1060;
  }
  
  .modal-box {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    overflow: hidden;
  }
  
  .modal-box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #dee2e6;
    background: #f8f9fa;
  }
  
  .modal-box-body {
    padding: 1.25rem;
  }
  
  .modal-box-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid #dee2e6;
    background: #f8f9fa;
  }
  
  .ticket {
    border: 2px dashed #0d6efd;
    border-radius: 8px;
    padding: 1rem;
    background: #f0f6ff;
  }
  </style>