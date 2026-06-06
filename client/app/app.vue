<template>
  <div>
    <!-- Navbar global -->
    <nav style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem 2rem;
      background: #1a1a2e;
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <!-- Izquierda: Logo + tabs -->
      <div style="display: flex; align-items: center; gap: 1.5rem;">
        <span style="font-size: 1.4rem; font-weight: bold; letter-spacing: 1px;">
          🅿️ ParkControl
        </span>
        <NuxtLink to="/" style="color: #ccc; text-decoration: none; font-size: 0.95rem;" active-class="nav-active">
          Inicio
        </NuxtLink>
        <template v-if="logueado">
          <NuxtLink to="/plazas" style="color: #ccc; text-decoration: none; font-size: 0.95rem;" active-class="nav-active">
            Plazas
          </NuxtLink>
          <NuxtLink to="/registros" style="color: #ccc; text-decoration: none; font-size: 0.95rem;" active-class="nav-active">
            Registros
          </NuxtLink>
          <!-- Aquí irán más tabs en el futuro -->
        </template>
      </div>

      <!-- Derecha: Auth -->
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <template v-if="!logueado">
          <NuxtLink to="/login">
            <button style="
              padding: 0.4rem 1.1rem;
              background: transparent;
              color: white;
              border: 1px solid #aaa;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.9rem;
            ">Iniciar sesión</button>
          </NuxtLink>
          <NuxtLink to="/register">
            <button style="
              padding: 0.4rem 1.1rem;
              background: #e63946;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 0.9rem;
            ">Registrarse</button>
          </NuxtLink>
        </template>
        <template v-else>
          <span style="color: #aaa; font-size: 0.9rem;">👤 {{ nombreUsuario }}</span>
          <button @click="cerrarSesion" style="
            padding: 0.4rem 1.1rem;
            background: #555;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
          ">Cerrar sesión</button>
        </template>
      </div>
    </nav>

    <!-- Contenido de cada página -->
    <NuxtPage />
  </div>
</template>

<script setup>
const logueado = ref(false);
const nombreUsuario = ref('');

const verificarSesion = () => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  logueado.value = !!token;
  nombreUsuario.value = usuario.nombre || 'Usuario';
};

const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  logueado.value = false;
  navigateTo('/');
};

// Verificar al montar y cuando cambia la ruta
onMounted(verificarSesion);
const route = useRoute();
watch(() => route.path, verificarSesion);
</script>

<style>
.nav-active {
  color: white !important;
  font-weight: bold;
  border-bottom: 2px solid #e63946;
  padding-bottom: 2px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #f5f5f5; }
</style>