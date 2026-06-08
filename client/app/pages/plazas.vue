<template>
  <div style="max-width: 900px; margin: 40px auto; padding: 1rem;">
    <h1>Gestión de Plazas</h1>

    <!-- Formulario crear / editar -->
    <div style="border: 1px solid #ccc; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
      <h2 style="margin-top: 0;">{{ editando ? 'Editar Plaza' : 'Nueva Plaza' }}</h2>

      <form @submit.prevent="editando ? actualizarPlaza() : crearPlaza()">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div>
            <label>Código</label><br>
            <input v-model="form.codigo" placeholder="Ej: A-01" style="padding: 0.4rem;" />
          </div>
          <div>
            <label>Tipo</label><br>
            <select v-model="form.tipo" style="padding: 0.4rem;">
              <option value="normal">Normal</option>
              <option value="discapacitado">Discapacitado</option>
              <option value="moto">Moto</option>
            </select>
          </div>
          <div>
            <label>Estado</label><br>
            <select v-model="form.estado" style="padding: 0.4rem;">
              <option value="libre">Libre</option>
              <option value="ocupada">Ocupada</option>
              <option value="reservada">Reservada</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div>
            <label>Planta</label><br>
            <input v-model.number="form.planta" type="number" min="1" style="padding: 0.4rem; width: 70px;" />
          </div>
        </div>

        <div v-if="errorForm" style="color: red; margin-top: 0.75rem;">{{ errorForm }}</div>

        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button type="submit" style="padding: 0.5rem 1.5rem; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">
            {{ editando ? 'Guardar cambios' : 'Crear plaza' }}
          </button>
          <button v-if="editando" type="button" @click="cancelarEdicion"
            style="padding: 0.5rem 1rem; background: #999; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </form>
    </div>

    <!-- Tabla de plazas -->
    <div v-if="cargando">Cargando plazas...</div>
    <div v-else-if="errorLista" style="color: red;">{{ errorLista }}</div>
    <table v-else style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="padding: 0.6rem; border: 1px solid #ddd;">ID</th>
          <th style="padding: 0.6rem; border: 1px solid #ddd;">Código</th>
          <th style="padding: 0.6rem; border: 1px solid #ddd;">Tipo</th>
          <th style="padding: 0.6rem; border: 1px solid #ddd;">Estado</th>
          <th style="padding: 0.6rem; border: 1px solid #ddd;">Planta</th>
          <th style="padding: 0.6rem; border: 1px solid #ddd;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="plaza in plazas" :key="plaza.id">
          <td style="padding: 0.6rem; border: 1px solid #ddd; text-align: center;">{{ plaza.id }}</td>
          <td style="padding: 0.6rem; border: 1px solid #ddd;">{{ plaza.codigo }}</td>
          <td style="padding: 0.6rem; border: 1px solid #ddd;">{{ plaza.tipo }}</td>
          <td style="padding: 0.6rem; border: 1px solid #ddd;">
            <span :style="{ color: coloresEstado[plaza.estado] || '#333' }">{{ plaza.estado }}</span>
          </td>
          <td style="padding: 0.6rem; border: 1px solid #ddd; text-align: center;">{{ plaza.planta }}</td>
          <td style="padding: 0.6rem; border: 1px solid #ddd; text-align: center;">
            <button @click="iniciarEdicion(plaza)"
              style="margin-right: 0.5rem; padding: 0.3rem 0.8rem; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ✏️ Editar
            </button>
            <button @click="eliminarPlaza(plaza.id)"
              style="padding: 0.3rem 0.8rem; background: #c00; color: white; border: none; border-radius: 4px; cursor: pointer;">
              🗑️ Eliminar
            </button>
          </td>
        </tr>
        <tr v-if="plazas.length === 0">
          <td colspan="6" style="text-align: center; padding: 1rem; color: #999;">No hay plazas registradas</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const API = config.public.apiUrl;

const plazas = ref([]);
const cargando = ref(true);
const errorLista = ref('');
const errorForm = ref('');
const editando = ref(null); // guarda el id de la plaza en edición

const form = reactive({
  codigo: '',
  tipo: 'normal',
  estado: 'libre',
  planta: 1,
});

const coloresEstado = {
  libre: 'green',
  ocupada: 'red',
  reservada: 'orange',
  mantenimiento: 'gray',
};

// Helper: headers con JWT
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

// ── GET todas las plazas ─────────────────────────────────────
const cargarPlazas = async () => {
  cargando.value = true;
  errorLista.value = '';
  try {
    const res = await fetch(`${API}/plazas`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al cargar plazas');
    plazas.value = data.data;
  } catch (e) {
    errorLista.value = e.message;
  } finally {
    cargando.value = false;
  }
};

// ── POST crear plaza ─────────────────────────────────────────
const crearPlaza = async () => {
  errorForm.value = '';
  try {
    const res = await fetch(`${API}/plazas`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear plaza');
    resetForm();
    await cargarPlazas();
  } catch (e) {
    errorForm.value = e.message;
  }
};

// ── PUT editar plaza ─────────────────────────────────────────
const iniciarEdicion = (plaza) => {
  editando.value = plaza.id;
  form.codigo = plaza.codigo;
  form.tipo = plaza.tipo;
  form.estado = plaza.estado;
  form.planta = plaza.planta;
};

const actualizarPlaza = async () => {
  errorForm.value = '';
  try {
    const res = await fetch(`${API}/plazas/${editando.value}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar plaza');
    cancelarEdicion();
    await cargarPlazas();
  } catch (e) {
    errorForm.value = e.message;
  }
};

const cancelarEdicion = () => {
  editando.value = null;
  resetForm();
};

// ── DELETE eliminar plaza ────────────────────────────────────
const eliminarPlaza = async (id) => {
  if (!confirm('¿Eliminar esta plaza?')) return;
  try {
    const res = await fetch(`${API}/plazas/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Error al eliminar');
    }
    await cargarPlazas();
  } catch (e) {
    alert(e.message);
  }
};

const resetForm = () => {
  form.codigo = '';
  form.tipo = 'normal';
  form.estado = 'libre';
  form.planta = 1;
};

// Cargar al montar
onMounted(cargarPlazas);
</script>

