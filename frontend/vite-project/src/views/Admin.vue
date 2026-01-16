<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const user = ref(null)

onMounted(() => {
  const userStr = localStorage.getItem("user")
  if (userStr) {
    user.value = JSON.parse(userStr)
    if (user.value?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  } else {
    router.push("/")
  }
})

function logout() {
  localStorage.removeItem("user")
  router.push("/")
}

function goToAlumnos() {
  router.push("/admin/alumnos")
}
</script>

<template>
  <div class="admin-container">
    <div class="admin-header">
      <div class="header-left">
        <img src="/logo.svg" alt="Potenza Gym Logo" class="logo-small" />
        <div>
          <h1>Panel Administrador</h1>
          <p class="admin-badge">ADMIN</p>
        </div>
      </div>
      <button @click="logout" class="logout-button">Cerrar Sesión</button>
    </div>

    <div class="admin-content">
      <div class="welcome-card">
        <h2>Panel de Control</h2>
        <p>Gestiona usuarios, rutinas y configuraciones del gimnasio.</p>
      </div>

      <div class="cards-grid">
        <div class="card" @click="goToAlumnos">
          <div class="card-icon">👥</div>
          <h3>Alumnos por Entrenador</h3>
          <p>Visualiza alumnos organizados por entrenador</p>
        </div>

        <div class="card">
          <div class="card-icon">👤</div>
          <h3>Gestión de Usuarios</h3>
          <p>Administra miembros y sus perfiles</p>
        </div>

        <div class="card">
          <div class="card-icon">📋</div>
          <h3>Rutinas y Planes</h3>
          <p>Crea y edita rutinas de entrenamiento</p>
        </div>

        <div class="card">
          <div class="card-icon">📊</div>
          <h3>Estadísticas</h3>
          <p>Visualiza métricas y reportes del gimnasio</p>
        </div>

        <div class="card">
          <div class="card-icon">💰</div>
          <h3>Pagos y Membresías</h3>
          <p>Gestiona pagos y planes de membresía</p>
        </div>

        <div class="card">
          <div class="card-icon">📅</div>
          <h3>Horarios y Clases</h3>
          <p>Configura horarios y clases disponibles</p>
        </div>

        <div class="card">
          <div class="card-icon">⚙️</div>
          <h3>Configuración</h3>
          <p>Ajustes generales del sistema</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, var(--potenza-light-grey) 0%, var(--potenza-grey-green) 100%);
  padding: 20px;
  padding-bottom: 40px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-small {
  width: 50px;
  height: 50px;
}

.admin-header h1 {
  color: var(--potenza-dark-grey);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.admin-badge {
  background: linear-gradient(135deg, var(--potenza-yellow) 0%, #FFA500 100%);
  color: var(--potenza-black);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  margin: 4px 0 0 0;
  display: inline-block;
  border: 1px solid var(--potenza-black);
}

.logout-button {
  background-color: var(--potenza-dark-grey);
  color: var(--potenza-yellow);
  border: 2px solid var(--potenza-black);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
}

.logout-button:active {
  transform: scale(0.98);
  background-color: #3A3A3A;
}

.admin-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--potenza-yellow);
}

.welcome-card h2 {
  color: var(--potenza-dark-grey);
  font-size: 1.5rem;
  margin: 0 0 8px 0;
}

.welcome-card p {
  color: var(--potenza-grey-green);
  margin: 0;
  font-size: 1rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}

.card:active {
  transform: scale(0.98);
  border-color: var(--potenza-yellow);
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.card h3 {
  color: var(--potenza-dark-grey);
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.card p {
  color: var(--potenza-grey-green);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

@media (min-width: 480px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
  