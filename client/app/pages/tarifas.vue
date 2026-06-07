<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">🏷️ Gestión de Tarifas</h2>
      <button class="btn btn-primary" @click="abrirModalCrear">+ Nueva Tarifa</button>
    </div>

    <!-- Error general -->
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Tabla -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Precio/hora</th>
              <th>Tipo vehículo</th>
              <th>Estado</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="text-center py-3 text-muted">Cargando tarifas...</td>
            </tr>
            <tr v-else-if="tarifas.length === 0">
              <td colspan="5" class="text-center py-3 text-muted">No hay tarifas registradas.</td>
            </tr>
            <tr v-for="t in tarifas" :key="t.id">
              <td class="fw-semibold">{{ t.nombre }}</td>
              <td>{{ Math.round(Number(t.precio_hora)).toLocaleString('es-CL') }} CLP/h</td>
              <td>
                <span class="badge" :class="badgeTipo(t.tipo_vehiculo)">
                  {{ t.tipo_vehiculo }}
                </span>
              </td>
              <td>
                <span class="badge" :class="t.activa ? 'bg-success' : 'bg-secondary'">
                  {{ t.activa ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-warning me-1" @click="abrirModalEditar(t)">Editar</button>
                <button class="btn btn-sm btn-outline-danger" @click="eliminar(t)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Crear / Editar -->
    <div v-if="mostrarModal" class="modal-backdrop-custom" @click.self="cerrarModal">
      <div class="modal-box">
        <h5 class="mb-3">{{ modoEdicion ? 'Editar Tarifa' : 'Nueva Tarifa' }}</h5>

        <div class="alert alert-danger py-2" v-if="formError">{{ formError }}</div>

        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input v-model="form.nombre" class="form-control" placeholder="Ej: Tarifa General" />
        </div>
        <div class="mb-3">
          <label class="form-label">Precio por hora (CLP)</label>
          <input v-model.number="form.precio_hora" type="number" step="1" min="0" class="form-control" placeholder="1500" />
        </div>
        <div class="mb-3">
          <label class="form-label">Tipo de vehículo</label>
          <select v-model="form.tipo_vehiculo" class="form-select">
            <option value="coche">Coche</option>
            <option value="moto">Moto</option>
            <option value="furgoneta">Furgoneta</option>
          </select>
        </div>
        <div class="mb-4 form-check">
          <input v-model="form.activa" type="checkbox" class="form-check-input" id="chkActiva" />
          <label class="form-check-label" for="chkActiva">Tarifa activa</label>
        </div>

        <div class="d-flex gap-2 justify-content-end">
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primary" @click="guardar" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (modoEdicion ? 'Guardar cambios' : 'Crear tarifa') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const API    = config.public.apiUrl;

const tarifas     = ref([]);
const loading     = ref(true);
const error       = ref('');
const mostrarModal = ref(false);
const modoEdicion  = ref(false);
const formError    = ref('');
const guardando    = ref(false);
const tarifaEditando = ref(null);

const form = ref({ nombre: '', precio_hora: '', tipo_vehiculo: 'coche', activa: true });

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ── Cargar ──────────────────────────────────────────────────
const cargar = async () => {
  loading.value = true;
  error.value   = '';
  try {
    const res  = await fetch(`${API}/tarifas`, { headers: headers() });
    const data = await res.json();
    if (data.ok) tarifas.value = data.data;
    else error.value = data.message;
  } catch {
    error.value = 'Error al conectar con la API';
  } finally {
    loading.value = false;
  }
};

// ── Modal ────────────────────────────────────────────────────
const abrirModalCrear = () => {
  modoEdicion.value = false;
  tarifaEditando.value = null;
  form.value = { nombre: '', precio_hora: '', tipo_vehiculo: 'coche', activa: true };
  formError.value = '';
  mostrarModal.value = true;
};

const abrirModalEditar = (t) => {
  modoEdicion.value    = true;
  tarifaEditando.value = t;
  form.value = { nombre: t.nombre, precio_hora: t.precio_hora, tipo_vehiculo: t.tipo_vehiculo, activa: t.activa };
  formError.value = '';
  mostrarModal.value = true;
};

const cerrarModal = () => { mostrarModal.value = false; };

// ── Guardar (crear o editar) ─────────────────────────────────
const guardar = async () => {
  formError.value = '';
  if (!form.value.nombre || !form.value.precio_hora) {
    formError.value = 'Nombre y precio son obligatorios'; return;
  }
  guardando.value = true;
  try {
    const url    = modoEdicion.value ? `${API}/tarifas/${tarifaEditando.value.id}` : `${API}/tarifas`;
    const method = modoEdicion.value ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, headers: headers(), body: JSON.stringify(form.value) });
    const data   = await res.json();
    if (!data.ok) { formError.value = data.message; return; }
    cerrarModal();
    await cargar();
  } catch {
    formError.value = 'Error al conectar con la API';
  } finally {
    guardando.value = false;
  }
};

// ── Eliminar ─────────────────────────────────────────────────
const eliminar = async (t) => {
  if (!confirm(`¿Eliminar la tarifa "${t.nombre}"?`)) return;
  try {
    const res  = await fetch(`${API}/tarifas/${t.id}`, { method: 'DELETE', headers: headers() });
    const data = await res.json();
    if (data.ok) await cargar();
    else error.value = data.message;
  } catch {
    error.value = 'Error al conectar con la API';
  }
};

// ── Badge colores ─────────────────────────────────────────────
const badgeTipo = (tipo) => ({
  coche:     'bg-primary',
  moto:      'bg-warning text-dark',
  furgoneta: 'bg-info text-dark',
}[tipo] || 'bg-secondary');

onMounted(cargar);
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1050;
}
.modal-box {
  background: white; border-radius: 12px;
  padding: 2rem; width: 100%; max-width: 480px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
</style>