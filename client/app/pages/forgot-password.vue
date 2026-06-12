<template>
  <div class="container mt-5" style="max-width:480px">
    <div class="card shadow-sm">
      <div class="card-body p-4">
        <h4 class="mb-1">🔑 Olvidé mi contraseña</h4>
        <p class="text-muted small mb-4">
          Ingresa tu email y te generaremos un token de recuperación
          (visible en la consola del servidor).
        </p>

        <div v-if="exito" class="alert alert-success">
          {{ exito }}
          <div class="mt-2">
            <NuxtLink to="/reset-password" class="btn btn-sm btn-success">
              Ingresar token →
            </NuxtLink>
          </div>
        </div>

        <form v-else @submit.prevent="enviar">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="email" type="email" class="form-control"
                   placeholder="tu@email.com" required />
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
            {{ cargando ? 'Enviando…' : 'Solicitar token' }}
          </button>

          <div class="text-center mt-3">
            <NuxtLink to="/login" class="text-muted small">← Volver al login</NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const config  = useRuntimeConfig()
const API     = config.public.apiUrl

const email   = ref('')
const error   = ref('')
const exito   = ref('')
const cargando = ref(false)

async function enviar() {
  error.value   = ''
  exito.value   = ''
  cargando.value = true
  try {
    const res  = await fetch(`${API}/auth/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })
    const data = await res.json()
    if (data.ok) exito.value = data.message
    else error.value = data.message
  } catch {
    error.value = 'Error al conectar con el servidor'
  } finally {
    cargando.value = false
  }
}
</script>