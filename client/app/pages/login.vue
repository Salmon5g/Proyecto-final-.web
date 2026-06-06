<template>
  <div style="max-width: 400px; margin: 80px auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px;">
    <h1 style="margin-bottom: 1.5rem;">Iniciar sesión</h1>

    <form @submit.prevent="handleLogin">
      <div style="margin-bottom: 1rem;">
        <label>Email</label><br>
        <input v-model="form.email" type="email" placeholder="tu@email.com" style="width: 100%; padding: 0.5rem;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Contraseña</label><br>
        <input v-model="form.password" type="password" placeholder="Tu contraseña" style="width: 100%; padding: 0.5rem;" />
      </div>

      <div v-if="error" style="color: red; margin-bottom: 1rem;">
        {{ error }}
      </div>

      <div v-if="success" style="color: green; margin-bottom: 1rem;">
        ¡Bienvenido! Redirigiendo...
      </div>

      <button type="submit" :disabled="loading" style="width: 100%; padding: 0.75rem; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">
        {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
      </button>
    </form>

    <p style="margin-top: 1rem; text-align: center;">
      ¿No tienes cuenta? <NuxtLink to="/register">Crear cuenta</NuxtLink>
    </p>

    <!-- Botón logout (visible si hay token) -->
    <div v-if="tokenGuardado" style="margin-top: 2rem; text-align: center;">
      <hr style="margin-bottom: 1rem;">
      <p style="color: #666; font-size: 0.9rem;">Sesión activa: {{ tokenGuardado }}</p>
      <button @click="handleLogout" style="padding: 0.5rem 1rem; background: #c00; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Cerrar sesión
      </button>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const router = useRouter();

const form = reactive({ email: '', password: '' });
const error = ref('');
const success = ref(false);
const loading = ref(false);
const tokenGuardado = ref('');

// Al montar la página, verificar si ya hay token guardado
onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    tokenGuardado.value = 'Sesión iniciada ✓';
  }
});

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    const res = await fetch(`${config.public.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.message || 'Credenciales inválidas';
      return;
    }

    // Guardar token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    success.value = true;
    setTimeout(() => router.push('/'), 1500);

  } catch (e) {
    error.value = 'Error de conexión con el servidor';
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  tokenGuardado.value = '';
};
</script>