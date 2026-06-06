<template>
  <div>
    <!-- Hero -->
    <div style="
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
      color: white;
      padding: 5rem 2rem;
      text-align: center;
    ">
      <div style="font-size: 4rem; margin-bottom: 1rem;">🅿️</div>
      <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Sistema de Control de Estacionamiento</h1>
      <p style="font-size: 1.1rem; color: #aaa; max-width: 520px; margin: 0 auto 2rem;">
        Gestiona plazas, controla entradas y salidas, y administra tarifas desde un solo lugar.
      </p>
      <div v-if="!logueado" style="display: flex; gap: 1rem; justify-content: center;">
        <NuxtLink to="/login">
          <button style="
            padding: 0.7rem 2rem;
            background: #e63946;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          ">Iniciar sesión</button>
        </NuxtLink>
        <NuxtLink to="/register">
          <button style="
            padding: 0.7rem 2rem;
            background: transparent;
            color: white;
            border: 2px solid white;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          ">Registrarse</button>
        </NuxtLink>
      </div>
      <div v-else>
        <p style="color: #4caf50; font-size: 1.1rem;">✅ Sesión activa — bienvenido/a, {{ nombreUsuario }}</p>
      </div>
    </div>

    <!-- Cards de funcionalidades -->
    <div style="max-width: 900px; margin: 3rem auto; padding: 0 1rem;">
      <h2 style="text-align: center; margin-bottom: 2rem; color: #333;">¿Qué puedes gestionar?</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">

        <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🚗</div>
          <h3 style="margin-bottom: 0.5rem;">Plazas</h3>
          <p style="color: #777; font-size: 0.9rem;">Crea, edita y elimina plazas. Controla su estado: libre, ocupada, reservada o en mantenimiento.</p>
          <NuxtLink v-if="logueado" to="/plazas">
            <button style="margin-top: 1rem; padding: 0.4rem 1.2rem; background: #1a1a2e; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Ir a Plazas →
            </button>
          </NuxtLink>
          <p v-else style="margin-top: 1rem; color: #aaa; font-size: 0.85rem;">🔒 Requiere sesión</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🚦</div>
          <h3 style="margin-bottom: 0.5rem;">Entradas / Salidas</h3>
          <p style="color: #777; font-size: 0.9rem;">Registra el ingreso y egreso de vehículos. Calcula automáticamente el tiempo y el importe.</p>
          <NuxtLink v-if="logueado" to="/registros">
            <button style="margin-top: 1rem; padding: 0.4rem 1.2rem; background: #1a1a2e; color: white; border: none; border-radius: 6px; cursor: pointer;">
              Ir a Registros →
            </button>
          </NuxtLink>
          <p v-else style="margin-top: 1rem; color: #aaa; font-size: 0.85rem;">🔒 Requiere sesión</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">💰</div>
          <h3 style="margin-bottom: 0.5rem;">Tarifas</h3>
          <p style="color: #777; font-size: 0.9rem;">Define el precio por hora según tipo de plaza o vehículo. Próximamente disponible.</p>
          <p style="margin-top: 1rem; color: #aaa; font-size: 0.85rem;">🔜 Próximamente</p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const logueado = ref(false);
const nombreUsuario = ref('');

onMounted(() => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  logueado.value = !!token;
  nombreUsuario.value = usuario.nombre || 'Usuario';
});
</script>