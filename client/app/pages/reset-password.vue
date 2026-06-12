<template>
  <div class="container mt-5" style="max-width:480px">
    <div class="card shadow-sm">
      <div class="card-body p-4">
        <h4 class="mb-1">🔐 Nueva contraseña</h4>
        <p class="text-muted small mb-4">
          Pega el token que aparece en la consola del servidor y elige tu nueva contraseña.
        </p>

        <div v-if="exito" class="alert alert-success">
          {{ exito }}
          <div class="mt-2">
            <NuxtLink to="/login" class="btn btn-sm btn-success">Ir al login →</NuxtLink>
          </div>
        </div>

        <form v-else @submit.prevent="confirmar">
          <div v-if="error" class="alert alert-danger">{{ error }}</div>

          <div class="mb-3">
            <label class="form-label">Token de recuperación</label>
            <input v-model="token" type="text" class="form-control font-monospace"
                   placeholder="Pega aquí el token" required />
          </div>

          <div class="mb-3">
            <label class="form-label">Nueva contraseña</label>
            <input v-model="password" type="password" class="form-control"
                   placeholder="Mínimo 6 caracteres" required />
          </div>

          <div class="mb-4">
            <label class="form-label">Confirmar contraseña</label>
            <input v-model="confirmacion" type="password" class="form-control"
                   placeholder="Repite la contraseña" required />
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
            {{ cargando ? 'Guardando…' : 'Restablecer contraseña' }}
          </button>

          <div class="text-center mt-3">
            <NuxtLink to="/forgot-password" class="text-muted small">← Solicitar nuevo token</NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const config  = useRuntimeConfig()
const API     = config.public.apiUrl

const token        = ref('')
const password     = ref('')
const confirmacion = ref('')
const error        = ref('')
const exito        = ref('')
const cargando     = ref(false)

async function confirmar() {
  error.value = ''
  exito.value = ''
  if (password.value !== confirmacion.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  cargando.value = true
  try {
    const res  = await fetch(`${API}/auth/reset/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value, password: password.value }),
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