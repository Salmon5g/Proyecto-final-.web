<template>
  <div style="max-width: 400px; margin: 80px auto; padding: 2rem; border: 1px solid #ccc; border-radius: 8px;">
    <h1 style="margin-bottom: 1.5rem;">Crear cuenta</h1>

    <form @submit.prevent="handleRegister">
      <div style="margin-bottom: 1rem;">
        <label>Nombre</label><br>
        <input v-model="form.nombre" type="text" placeholder="Tu nombre" style="width: 100%; padding: 0.5rem;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Email</label><br>
        <input v-model="form.email" type="email" placeholder="tu@email.com" style="width: 100%; padding: 0.5rem;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <label>Contraseña</label><br>
        <input v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" style="width: 100%; padding: 0.5rem;" />
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" style="color: red; margin-bottom: 1rem;">
        {{ error }}
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="success" style="color: green; margin-bottom: 1rem;">
        ¡Cuenta creada! Redirigiendo...
      </div>

      <button type="submit" :disabled="loading" style="width: 100%; padding: 0.75rem; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">
        {{ loading ? 'Registrando...' : 'Crear cuenta' }}
      </button>
    </form>

    <p style="margin-top: 1rem; text-align: center;">
      ¿Ya tienes cuenta? <NuxtLink to="/login">Iniciar sesión</NuxtLink>
    </p>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
const router = useRouter();

const form = reactive({ nombre: '', email: '', password: '' });
const error = ref('');
const success = ref(false);
const loading = ref(false);

const handleRegister = async () => {
  error.value = '';
  loading.value = true;

  try {
    const res = await fetch(`${config.public.apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.message || 'Error al registrar';
      return;
    }

    success.value = true;
    setTimeout(() => router.push('/login'), 1500);
  } catch (e) {
    error.value = 'Error de conexión con el servidor';
  } finally {
    loading.value = false;
  }
};
</script>