<template>
  <div style="max-width: 900px; margin: 2rem auto; padding: 0 1rem;">
    <h1 style="font-size: 1.6rem; margin-bottom: 0.25rem;">📊 Reporte por Zona</h1>
    <p style="color: #666; margin-bottom: 1.5rem;">Ingresos y actividad agrupados por planta</p>

    <!-- Filtros de fecha -->
    <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; margin-bottom: 1.5rem;
                background: white; padding: 1.25rem; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
      <div>
        <label style="display: block; font-size: 0.85rem; color: #555; margin-bottom: 0.3rem;">Desde</label>
        <input v-model="filtro.desde" type="date"
          style="padding: 0.45rem 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;" />
      </div>
      <div>
        <label style="display: block; font-size: 0.85rem; color: #555; margin-bottom: 0.3rem;">Hasta</label>
        <input v-model="filtro.hasta" type="date"
          style="padding: 0.45rem 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem;" />
      </div>
      <button @click="cargarReporte" :disabled="cargando"
        style="padding: 0.5rem 1.25rem; background: #1a1a2e; color: white; border: none;
               border-radius: 6px; cursor: pointer; font-size: 0.95rem;">
        {{ cargando ? 'Cargando...' : '🔍 Generar reporte' }}
      </button>
      <button @click="limpiarFiltros"
        style="padding: 0.5rem 1rem; background: transparent; color: #555; border: 1px solid #ccc;
               border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
        Limpiar
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" style="background: #fee; color: #c33; padding: 0.75rem 1rem;
         border-radius: 8px; margin-bottom: 1rem;">{{ error }}</div>

    <!-- Estado vacío inicial -->
    <div v-if="!generado" style="text-align: center; color: #999; padding: 3rem;">
      Selecciona un rango de fechas y haz clic en "Generar reporte"
    </div>

    <template v-else>
      <!-- Card resumen total -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: #1a1a2e; color: white; padding: 1.25rem; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 0.25rem;">Total registros</div>
          <div style="font-size: 2rem; font-weight: bold;">{{ totales.total_registros }}</div>
        </div>
        <div style="background: #2a9d8f; color: white; padding: 1.25rem; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 0.25rem;">Ingresos totales</div>
          <div style="font-size: 1.5rem; font-weight: bold;">{{ formatCLP(totales.ingresos_totales) }}</div>
        </div>
        <div style="background: #e9c46a; color: #333; padding: 1.25rem; border-radius: 10px; text-align: center;">
          <div style="font-size: 0.85rem; opacity: 0.6; margin-bottom: 0.25rem;">Zonas activas</div>
          <div style="font-size: 2rem; font-weight: bold;">{{ zonas.length }}</div>
        </div>
      </div>

      <!-- Sin datos -->
      <div v-if="zonas.length === 0"
        style="text-align: center; color: #999; background: white; padding: 2.5rem;
               border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
        No hay registros completados en el período seleccionado
      </div>

      <!-- Tabla de zonas -->
      <div v-else style="background: white; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa; text-align: left;">
              <th style="padding: 0.9rem 1.25rem; font-size: 0.85rem; color: #666; font-weight: 600;">Zona (Planta)</th>
              <th style="padding: 0.9rem 1.25rem; font-size: 0.85rem; color: #666; font-weight: 600;">Total registros</th>
              <th style="padding: 0.9rem 1.25rem; font-size: 0.85rem; color: #666; font-weight: 600;">Promedio minutos</th>
              <th style="padding: 0.9rem 1.25rem; font-size: 0.85rem; color: #666; font-weight: 600;">Ingresos</th>
              <th style="padding: 0.9rem 1.25rem; font-size: 0.85rem; color: #666; font-weight: 600;">% del total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="z in zonas" :key="z.zona"
              style="border-top: 1px solid #f0f0f0; transition: background 0.15s;"
              @mouseover="e => e.currentTarget.style.background='#f9f9f9'"
              @mouseleave="e => e.currentTarget.style.background='white'">
              <td style="padding: 0.85rem 1.25rem; font-weight: 600;">
                🅿️ Planta {{ z.zona === 0 ? 'Sin asignar' : z.zona }}
              </td>
              <td style="padding: 0.85rem 1.25rem;">{{ z.total_registros }}</td>
              <td style="padding: 0.85rem 1.25rem;">{{ Number(z.promedio_minutos).toFixed(1) }} min</td>
              <td style="padding: 0.85rem 1.25rem; color: #2a9d8f; font-weight: 600;">
                {{ formatCLP(z.ingresos_totales) }}
              </td>
              <td style="padding: 0.85rem 1.25rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="flex: 1; background: #eee; border-radius: 4px; height: 8px;">
                    <div :style="{
                      width: porcentaje(z.ingresos_totales) + '%',
                      background: '#2a9d8f',
                      height: '8px',
                      borderRadius: '4px'
                    }"></div>
                  </div>
                  <span style="font-size: 0.85rem; color: #666; min-width: 36px;">
                    {{ porcentaje(z.ingresos_totales) }}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
const config  = useRuntimeConfig();
const baseUrl = config.public.apiUrl;

const filtro   = ref({ desde: '', hasta: '' });
const zonas    = ref([]);
const totales  = ref({ total_registros: 0, ingresos_totales: 0 });
const cargando = ref(false);
const error    = ref('');
const generado = ref(false);

const formatCLP = (val) =>
  Math.round(Number(val)).toLocaleString('es-CL') + ' CLP';

const porcentaje = (ingresos) => {
  if (!totales.value.ingresos_totales) return 0;
  return Math.round((Number(ingresos) / totales.value.ingresos_totales) * 100);
};

const cargarReporte = async () => {
  cargando.value = true;
  error.value    = '';
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filtro.value.desde) params.append('desde', filtro.value.desde);
    if (filtro.value.hasta) params.append('hasta', filtro.value.hasta);

    const res  = await fetch(`${baseUrl}/reportes/zona?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.message);

    zonas.value   = json.data.zonas;
    totales.value = json.data.totales;
    generado.value = true;
  } catch (e) {
    error.value = e.message;
  } finally {
    cargando.value = false;
  }
};

const limpiarFiltros = () => {
  filtro.value = { desde: '', hasta: '' };
  zonas.value  = [];
  totales.value = { total_registros: 0, ingresos_totales: 0 };
  generado.value = false;
  error.value  = '';
};
</script>