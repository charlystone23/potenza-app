<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const entrenadores = ref([])

// Datos de ejemplo - en producción vendrían de la API
// Cada entrenador tiene sus alumnos
const entrenadoresEjemplo = [
  {
    id: 1,
    nombre: "Carlos",
    apellido: "Trainer",
    email: "carlos@potenza.com",
    alumnos: [
      { 
        id: 1, 
        nombre: "Juan", 
        apellido: "Pérez", 
        historialPagos: [
          { fecha: new Date(2024, 0, 15), tipo: "efectivo" }
        ]
      },
      { 
        id: 2, 
        nombre: "María", 
        apellido: "González", 
        historialPagos: [
          { fecha: new Date(2024, 0, 20), tipo: "transferencia" }
        ]
      },
      { 
        id: 3, 
        nombre: "Carlos", 
        apellido: "Rodríguez", 
        historialPagos: [
          { fecha: new Date(2024, 0, 5), tipo: "efectivo" }
        ]
      }
    ]
  },
  {
    id: 2,
    nombre: "Ana",
    apellido: "Coach",
    email: "ana@potenza.com",
    alumnos: [
      { 
        id: 4, 
        nombre: "Ana", 
        apellido: "Martínez", 
        historialPagos: [
          { fecha: new Date(2024, 1, 1), tipo: "transferencia" }
        ]
      },
      { 
        id: 5, 
        nombre: "Luis", 
        apellido: "Sánchez", 
        historialPagos: [
          { fecha: new Date(2024, 0, 25), tipo: "otros" }
        ]
      }
    ]
  }
]

onMounted(() => {
  // En producción, esto vendría de una API
  entrenadores.value = entrenadoresEjemplo.map(entrenador => ({
    ...entrenador,
    alumnos: entrenador.alumnos.map(alumno => ({
      ...alumno,
      historialPagos: alumno.historialPagos || []
    }))
  }))
})

function getUltimoPago(alumno) {
  if (!alumno.historialPagos || alumno.historialPagos.length === 0) {
    return null
  }
  const pagosOrdenados = [...alumno.historialPagos].sort((a, b) => 
    new Date(b.fecha) - new Date(a.fecha)
  )
  return pagosOrdenados[0]
}

function getPaymentStatus(alumno) {
  const ultimoPago = getUltimoPago(alumno)
  if (!ultimoPago) return "red"
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  const fechaPagoDate = new Date(ultimoPago.fecha)
  fechaPagoDate.setHours(0, 0, 0, 0)
  
  const proximaFechaPago = new Date(fechaPagoDate)
  proximaFechaPago.setDate(proximaFechaPago.getDate() + 30)
  
  const diasHastaPago = Math.ceil((proximaFechaPago - hoy) / (1000 * 60 * 60 * 24))
  
  if (diasHastaPago < 0) {
    return "red"
  } else if (diasHastaPago <= 5) {
    return "yellow"
  } else {
    return "green"
  }
}

function formatDate(date) {
  const fecha = new Date(date)
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const año = fecha.getFullYear()
  return `${dia}/${mes}/${año}`
}

function getDaysUntilPayment(alumno) {
  const ultimoPago = getUltimoPago(alumno)
  if (!ultimoPago) return -999
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  const fechaPago = new Date(ultimoPago.fecha)
  const proximaFecha = new Date(fechaPago)
  proximaFecha.setDate(proximaFecha.getDate() + 30)
  
  const dias = Math.ceil((proximaFecha - hoy) / (1000 * 60 * 60 * 24))
  return dias
}

function goBack() {
  router.push("/admin")
}
</script>

<template>
  <div class="admin-alumnos-container">
    <div class="admin-alumnos-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">←</button>
        <img src="/logo.svg" alt="Potenza Gym Logo" class="logo-small" />
        <div>
          <h1>Alumnos por Entrenador</h1>
          <p class="subtitle">Visualiza los alumnos organizados por entrenador</p>
        </div>
      </div>
    </div>

    <div class="admin-alumnos-content">
      <div class="legend">
        <div class="legend-item">
          <div class="status-indicator green"></div>
          <span>Al día</span>
        </div>
        <div class="legend-item">
          <div class="status-indicator yellow"></div>
          <span>Próximo pago (5 días)</span>
        </div>
        <div class="legend-item">
          <div class="status-indicator red"></div>
          <span>Pago retrasado</span>
        </div>
      </div>

      <div class="entrenadores-list">
        <div 
          v-for="entrenador in entrenadores" 
          :key="entrenador.id" 
          class="entrenador-card"
        >
          <div class="entrenador-header">
            <div class="entrenador-info">
              <h2>{{ entrenador.nombre }} {{ entrenador.apellido }}</h2>
              <p class="entrenador-email">{{ entrenador.email }}</p>
              <p class="alumnos-count">{{ entrenador.alumnos.length }} alumno(s)</p>
            </div>
          </div>

          <div class="alumnos-section">
            <div 
              v-for="alumno in entrenador.alumnos" 
              :key="alumno.id" 
              class="alumno-item"
            >
              <div class="alumno-details">
                <h3>{{ alumno.nombre }} {{ alumno.apellido }}</h3>
                <div class="alumno-payment-info">
                  <p v-if="getUltimoPago(alumno)" class="payment-info">
                    Último pago: {{ formatDate(getUltimoPago(alumno).fecha) }} 
                    <span class="payment-type">({{ getUltimoPago(alumno).tipo }})</span>
                  </p>
                  <p v-else class="payment-info">Sin pagos registrados</p>
                </div>
              </div>
              <div class="status-container">
                <div 
                  :class="['status-light', getPaymentStatus(alumno)]"
                  :title="getPaymentStatus(alumno) === 'red' 
                    ? 'Pago retrasado' 
                    : getPaymentStatus(alumno) === 'yellow' 
                    ? `Próximo pago en ${getDaysUntilPayment(alumno)} días`
                    : 'Pago al día'"
                ></div>
                <span class="days-info" v-if="getPaymentStatus(alumno) !== 'green'">
                  {{ getDaysUntilPayment(alumno) < 0 
                    ? `${Math.abs(getDaysUntilPayment(alumno))} días de retraso`
                    : `${getDaysUntilPayment(alumno)} días` }}
                </span>
              </div>
            </div>

            <div v-if="entrenador.alumnos.length === 0" class="no-alumnos">
              <p>Este entrenador no tiene alumnos asignados</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="entrenadores.length === 0" class="empty-state">
        <p>No hay entrenadores registrados</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-alumnos-container {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, var(--potenza-light-grey) 0%, var(--potenza-grey-green) 100%);
  padding: 20px;
  padding-bottom: 40px;
}

.admin-alumnos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  background-color: var(--potenza-dark-grey);
  color: var(--potenza-yellow);
  border: 2px solid var(--potenza-black);
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 44px;
  min-width: 44px;
}

.back-button:active {
  transform: scale(0.98);
  background-color: #3A3A3A;
}

.logo-small {
  width: 50px;
  height: 50px;
}

.admin-alumnos-header h1 {
  color: var(--potenza-dark-grey);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  color: var(--potenza-grey-green);
  font-size: 0.9rem;
  margin: 4px 0 0 0;
  font-weight: 500;
}

.admin-alumnos-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.legend {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--potenza-yellow);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--potenza-dark-grey);
}

.status-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--potenza-black);
}

.status-indicator.green {
  background-color: #22c55e;
}

.status-indicator.yellow {
  background-color: #eab308;
}

.status-indicator.red {
  background-color: #ef4444;
}

.entrenadores-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.entrenador-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--potenza-yellow);
}

.entrenador-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--potenza-yellow);
}

.entrenador-info h2 {
  color: var(--potenza-dark-grey);
  font-size: 1.5rem;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.entrenador-email {
  color: var(--potenza-grey-green);
  font-size: 0.9rem;
  margin: 0 0 8px 0;
}

.alumnos-count {
  color: var(--potenza-dark-grey);
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
}

.alumnos-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alumno-item {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border: 1px solid #e5e7eb;
}

.alumno-details {
  flex: 1;
}

.alumno-details h3 {
  color: var(--potenza-dark-grey);
  font-size: 1.1rem;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.payment-info {
  color: var(--potenza-grey-green);
  font-size: 0.85rem;
  margin: 0;
}

.payment-type {
  color: var(--potenza-dark-grey);
  text-transform: capitalize;
  font-weight: 500;
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.status-light {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid var(--potenza-black);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.status-light.green {
  background-color: #22c55e;
}

.status-light.yellow {
  background-color: #eab308;
}

.status-light.red {
  background-color: #ef4444;
}

.days-info {
  font-size: 0.75rem;
  color: var(--potenza-dark-grey);
  font-weight: 600;
  text-align: center;
}

.no-alumnos {
  text-align: center;
  padding: 20px;
  color: var(--potenza-grey-green);
  font-size: 0.9rem;
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: var(--potenza-grey-green);
  font-size: 1rem;
}
</style>
