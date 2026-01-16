<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { login } from "../services/api"

const router = useRouter()

const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = "Por favor, completa todos los campos"
    return
  }

  loading.value = true
  error.value = ""

  try {
    const response = await login(email.value, password.value)
    
    if (response.success) {
      localStorage.setItem("user", JSON.stringify(response.user))
      router.push(response.user.role === "ADMIN" ? "/admin" : "/dashboard")
    } else {
      error.value = response.message || "Credenciales incorrectas"
    }
  } catch (err) {
    error.value = "Error de conexión. Intenta más tarde."
    console.error("Login error:", err)
  } finally {
    loading.value = false
  }
}

function fakeLoginAdmin() {
  const user = { role: "ADMIN", name: "Admin" }
  localStorage.setItem("user", JSON.stringify(user))
  router.push("/admin")
}

function fakeLoginUser() {
  const user = { role: "USER", name: "Usuario" }
  localStorage.setItem("user", JSON.stringify(user))
  router.push("/dashboard")
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-container">
          <img src="/logo.svg" alt="Potenza Gym Logo" class="logo" />
        </div>
        <h1>Potenza Gym</h1>
        <p class="subtitle">Inicia sesión en tu cuenta</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="loading">Iniciando sesión...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <div class="divider">
        <span>o</span>
      </div>

      <div class="mock-buttons">
        <button @click="fakeLoginUser" class="mock-button mock-user" :disabled="loading">
          Entrar como Usuario (Mock)
        </button>
        <button @click="fakeLoginAdmin" class="mock-button mock-admin" :disabled="loading">
          Entrar como Admin (Mock)
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #E5E5E5 0%, #4A5D4A 100%);
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.login-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 32px 24px;
  width: 100%;
  max-width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.logo {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #2D2D2D;
}

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  text-align: left;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 16px; /* Prevents zoom on iOS */
  transition: all 0.2s;
  font-family: inherit;
  -webkit-appearance: none;
  appearance: none;
  touch-action: manipulation;
}

.form-group input:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.15);
}

.form-group input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
}

.login-button {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #2D2D2D;
  border: 2px solid #000000;
  padding: 16px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 8px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px; /* Better touch target */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.login-button:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.divider span {
  padding: 0 16px;
}

.mock-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mock-button {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  border: 2px solid #000000;
}

.mock-user {
  background-color: #2D2D2D;
  color: #FFD700;
}

.mock-admin {
  background-color: #FFD700;
  color: #2D2D2D;
}

.mock-button:active:not(:disabled) {
  transform: scale(0.98);
}

.mock-user:active:not(:disabled) {
  background-color: #3A3A3A;
}

.mock-admin:active:not(:disabled) {
  background-color: #FFA500;
}

.mock-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .login-card {
    background: #2D2D2D;
  }

  .login-header h1 {
    color: #FFD700;
  }

  .subtitle {
    color: #E5E5E5;
  }

  .form-group label {
    color: #E5E5E5;
  }

  .form-group input {
    background-color: #3A3A3A;
    border-color: #4A5D4A;
    color: #FFFFFF;
  }

  .form-group input:focus {
    border-color: #FFD700;
  }

  .mock-button {
    background-color: #3A3A3A;
    color: #FFD700;
    border-color: #FFD700;
  }

  .mock-button:active:not(:disabled) {
    background-color: #4A4A4A;
  }
}
</style>
    