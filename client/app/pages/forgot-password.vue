<template>
  <div class="auth-bg">
    <div class="auth-card">

      <!-- ── SUCCESS STATE (reemplaza todo) ── -->
      <div v-if="exito" class="success-state text-center">
        <div class="success-big-icon mb-3">✅</div>
        <h5 class="fw-bold text-white mb-2">¡Token generado!</h5>
        <p class="text-white-50 small mb-4">{{ exito }}</p>

        <NuxtLink to="/reset-password" class="btn btn-success w-100 btn-styled mb-3">
          Ingresar token →
        </NuxtLink>
        <NuxtLink to="/login" class="back-link">← Volver al login</NuxtLink>
      </div>

      <!-- ── FORM STATE ── -->
      <template v-else>
        <!-- Header -->
        <div class="text-center mb-4">
          <div class="auth-icon-wrap mb-3">
            <span class="auth-icon">🔑</span>
          </div>
          <h4 class="fw-bold text-white mb-1">Olvidé mi contraseña</h4>
          <p class="text-white-50 small mb-0">
            Ingresa tu email y generaremos un token de recuperación
            <br><span class="badge bg-warning text-dark mt-1">visible en consola del servidor</span>
          </p>
        </div>

        <form @submit.prevent="enviar" class="px-1">
          <div v-if="error" class="error-alert mb-3">
            <span>⚠️</span> {{ error }}
          </div>

          <div class="mb-4">
            <label class="field-label">Correo electrónico</label>
            <div class="input-group-styled">
              <span class="input-prefix">✉️</span>
              <input
                v-model="email"
                type="email"
                class="field-input"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 btn-styled" :disabled="cargando">
            <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
            {{ cargando ? 'Enviando…' : 'Solicitar token de recuperación' }}
          </button>

          <div class="text-center mt-4">
            <NuxtLink to="/login" class="back-link">← Volver al login</NuxtLink>
          </div>
        </form>
      </template>

    </div>
  </div>
</template>

<script setup>
const config   = useRuntimeConfig()
const API      = config.public.apiUrl

const email    = ref('')
const error    = ref('')
const exito    = ref('')
const cargando = ref(false)

async function enviar() {
  error.value    = ''
  exito.value    = ''
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

<style scoped>
/* ── Background ── */
.auth-bg {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  min-height: 100vh;
  display: flex;
  align-items: flex-start;      /* sin Bootstrap !important que corta el contenido */
  justify-content: center;
  padding: 3rem 1rem;
}

/* ── Success state standalone ── */
.success-state {
  padding: 2rem 0.5rem;
}
.success-big-icon {
  font-size: 4rem;
  line-height: 1;
}
.success-state .back-link {
  display: block;               /* evita que quede inline junto al botón */
  margin-top: 0.25rem;
}

/* ── Card ── */
.auth-card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
  color: #fff;
}

/* ── Header icon ── */
.auth-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}
.auth-icon { font-size: 2rem; }

/* ── Field label ── */
.field-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.45rem;
}

/* ── Input wrapper ── */
.input-group-styled {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.65rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: hidden;
}
.input-group-styled:focus-within {
  border-color: #4fc3f7;
  box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.2);
}
.input-prefix {
  padding: 0 0.85rem;
  font-size: 1rem;
  opacity: 0.7;
}
.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  padding: 0.72rem 0.75rem 0.72rem 0;
  font-size: 0.95rem;
}
.field-input::placeholder { color: rgba(255,255,255,0.35); }

/* ── Primary button ── */
.btn-styled {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 0.65rem;
  letter-spacing: 0.02em;
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-styled:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
.btn-primary.btn-styled {
  background: linear-gradient(135deg, #0288d1, #26c6da);
  border: none;
}
.btn-success.btn-styled {
  background: linear-gradient(135deg, #2e7d32, #43a047);
  border: none;
}

/* ── Error alert ── */
.error-alert {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid rgba(244, 67, 54, 0.4);
  border-radius: 0.65rem;
  color: #ff8a80;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ── Success box ── */
.success-box {
  background: rgba(56, 142, 60, 0.1);
  border: 1px solid rgba(56, 142, 60, 0.3);
  border-radius: 0.85rem;
}
.success-checkmark { font-size: 2.5rem; }

/* ── Back link ── */
.back-link {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  transition: color 0.2s;
}
.back-link:hover { color: #4fc3f7; }


</style>