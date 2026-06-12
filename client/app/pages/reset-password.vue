<template>
  <div class="auth-bg d-flex align-items-center justify-content-center min-vh-100">
    <div class="auth-card">

      <!-- Header -->
      <div class="auth-header text-center mb-4">
        <div class="auth-icon-wrap mb-3">
          <span class="auth-icon">🔐</span>
        </div>
        <h4 class="fw-bold text-white mb-1">Nueva contraseña</h4>
        <p class="text-white-50 small mb-0">
          Pega el token de la consola del servidor<br>y elige tu nueva contraseña.
        </p>
      </div>

      <!-- Success state -->
      <div v-if="exito" class="success-box text-center p-4">
        <div class="success-checkmark mb-3">🎉</div>
        <p class="text-success fw-semibold mb-3">{{ exito }}</p>
        <NuxtLink to="/login" class="btn btn-success w-100 btn-styled">
          Ir al login →
        </NuxtLink>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="confirmar" class="px-1">
        <div v-if="error" class="error-alert mb-3">
          <span>⚠️</span> {{ error }}
        </div>

        <!-- Token -->
        <div class="mb-3">
          <label class="field-label">Token de recuperación</label>
          <div class="input-group-styled">
            <span class="input-prefix">🔖</span>
            <input
              v-model="token"
              type="text"
              class="field-input font-monospace"
              placeholder="Pega aquí el token"
              required
            />
          </div>
        </div>

        <!-- Password strength hint -->
        <div class="mb-3">
          <label class="field-label">Nueva contraseña</label>
          <div class="input-group-styled" :class="{ 'focused-error': passwordDebil }">
            <span class="input-prefix">🔒</span>
            <input
              v-model="password"
              type="password"
              class="field-input"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div v-if="password && password.length < 6" class="field-hint warn">
            ⚡ La contraseña debe tener al menos 6 caracteres
          </div>
          <div v-else-if="password && password.length >= 6" class="field-hint ok">
            ✓ Longitud correcta
          </div>
        </div>

        <!-- Confirm -->
        <div class="mb-4">
          <label class="field-label">Confirmar contraseña</label>
          <div class="input-group-styled" :class="{ 'focused-error': mismatch }">
            <span class="input-prefix">🔒</span>
            <input
              v-model="confirmacion"
              type="password"
              class="field-input"
              placeholder="Repite la contraseña"
              required
            />
          </div>
          <div v-if="mismatch" class="field-hint warn">
            ⚡ Las contraseñas no coinciden
          </div>
          <div v-else-if="confirmacion && !mismatch" class="field-hint ok">
            ✓ Las contraseñas coinciden
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 btn-styled" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'Guardando…' : 'Restablecer contraseña' }}
        </button>

        <div class="text-center mt-4">
          <NuxtLink to="/forgot-password" class="back-link">← Solicitar nuevo token</NuxtLink>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
const config       = useRuntimeConfig()
const API          = config.public.apiUrl

const token        = ref('')
const password     = ref('')
const confirmacion = ref('')
const error        = ref('')
const exito        = ref('')
const cargando     = ref(false)

const mismatch    = computed(() => confirmacion.value && password.value !== confirmacion.value)
const passwordDebil = computed(() => password.value && password.value.length < 6)

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

<style scoped>
/* ── Background ── */

/* ── Background (overflow fix) ── */
.auth-bg {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  min-height: 100vh;
  align-items: flex-start;          /* permite que la card crezca sin cortarse */
  padding: 4rem 1rem;
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
.input-group-styled.focused-error {
  border-color: rgba(255, 100, 100, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 100, 100, 0.15);
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

/* ── Inline hints ── */
.field-hint {
  font-size: 0.78rem;
  margin-top: 0.35rem;
  padding-left: 0.25rem;
}
.field-hint.warn { color: #ffb74d; }
.field-hint.ok   { color: #81c784; }

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