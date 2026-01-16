<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const alumnos = ref([])
const showModal = ref(false)
const showPaymentModal = ref(false)
const alumnoSeleccionado = ref(null)
const historialVisible = ref({}) // Objeto para rastrear qué historiales están visibles
const nuevoAlumno = ref({
  nombre: "",
  apellido: "",
  fechaPago: ""
})
const nuevoPago = ref({
  fechaPago: "",
  tipoPago: "efectivo"
})
const error = ref("")

// Datos de ejemplo - en producción vendrían de la API
const alumnosEjemplo = [
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
  },
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
  },
]

onMounted(() => {
  // En producción, esto vendría de una API
  alumnos.value = alumnosEjemplo.map(alumno => ({
    ...alumno,
    historialPagos: alumno.historialPagos || []
  }))
})

function getUltimoPago(alumno) {
  if (!alumno.historialPagos || alumno.historialPagos.length === 0) {
    return null
  }
  // Ordenar por fecha descendente y tomar el más reciente
  const pagosOrdenados = [...alumno.historialPagos].sort((a, b) => 
    new Date(b.fecha) - new Date(a.fecha)
  )
  return pagosOrdenados[0]
}

function getUltimosPagos(alumno, cantidad = 3) {
  if (!alumno.historialPagos || alumno.historialPagos.length === 0) {
    return []
  }
  // Ordenar por fecha descendente y tomar los últimos N
  const pagosOrdenados = [...alumno.historialPagos].sort((a, b) => 
    new Date(b.fecha) - new Date(a.fecha)
  )
  return pagosOrdenados.slice(0, cantidad)
}

function toggleHistorial(alumnoId) {
  historialVisible.value[alumnoId] = !historialVisible.value[alumnoId]
}

function isHistorialVisible(alumnoId) {
  return historialVisible.value[alumnoId] || false
}

function getPaymentStatus(alumno) {
  const ultimoPago = getUltimoPago(alumno)
  if (!ultimoPago) return "red"
  
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  
  const fechaPagoDate = new Date(ultimoPago.fecha)
  fechaPagoDate.setHours(0, 0, 0, 0)
  
  // Calcular la próxima fecha de pago (30 días después)
  const proximaFechaPago = new Date(fechaPagoDate)
  proximaFechaPago.setDate(proximaFechaPago.getDate() + 30)
  
  // Calcular días hasta el próximo pago
  const diasHastaPago = Math.ceil((proximaFechaPago - hoy) / (1000 * 60 * 60 * 24))
  
  if (diasHastaPago < 0) {
    return "red" // Pago retrasado
  } else if (diasHastaPago <= 5) {
    return "yellow" // 5 días o menos antes del pago
  } else {
    return "green" // Al día
  }
}

function formatDate(date) {
  const fecha = new Date(date)
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const año = fecha.getFullYear()
  return `${dia}/${mes}/${año}`
}

function formatNextPaymentDate(alumno) {
  const ultimoPago = getUltimoPago(alumno)
  if (!ultimoPago) return "Sin pago"
  
  const fechaPago = new Date(ultimoPago.fecha)
  const proximaFecha = new Date(fechaPago)
  proximaFecha.setDate(proximaFecha.getDate() + 30)
  const dia = String(proximaFecha.getDate()).padStart(2, '0')
  const mes = String(proximaFecha.getMonth() + 1).padStart(2, '0')
  const año = proximaFecha.getFullYear()
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
  router.push("/dashboard")
}

function openModal() {
  showModal.value = true
  error.value = ""
  nuevoAlumno.value = {
    nombre: "",
    apellido: "",
    fechaPago: ""
  }
}

function closeModal() {
  showModal.value = false
  error.value = ""
  nuevoAlumno.value = {
    nombre: "",
    apellido: "",
    fechaPago: ""
  }
}

function parseDateString(dateString) {
  // Convierte dd/mm/yyyy a Date
  const parts = dateString.split('/')
  if (parts.length !== 3) return null
  
  const dia = parseInt(parts[0], 10)
  const mes = parseInt(parts[1], 10) - 1 // Los meses en JS son 0-indexed
  const año = parseInt(parts[2], 10)
  
  if (isNaN(dia) || isNaN(mes) || isNaN(año)) return null
  
  const fecha = new Date(año, mes, dia)
  
  // Validar que la fecha sea válida
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes || fecha.getFullYear() !== año) {
    return null
  }
  
  return fecha
}

function formatDateInput(value) {
  // Remover todo lo que no sea número
  let numbers = value.replace(/\D/g, '')
  
  // Aplicar formato dd/mm/yyyy
  if (numbers.length <= 2) {
    return numbers
  } else if (numbers.length <= 4) {
    return numbers.slice(0, 2) + '/' + numbers.slice(2)
  } else {
    return numbers.slice(0, 2) + '/' + numbers.slice(2, 4) + '/' + numbers.slice(4, 8)
  }
}

function handleDateInput(event) {
  const input = event.target
  const formatted = formatDateInput(input.value)
  
  // Limitar a 10 caracteres (dd/mm/yyyy)
  const finalValue = formatted.length > 10 ? formatted.slice(0, 10) : formatted
  
  // Determinar si es para nuevo alumno o nuevo pago
  if (input.id === 'fechaPago') {
    nuevoAlumno.value.fechaPago = finalValue
  } else if (input.id === 'fechaPagoPago') {
    nuevoPago.value.fechaPago = finalValue
  }
}

function agregarAlumno() {
  // Validar campos
  if (!nuevoAlumno.value.nombre.trim()) {
    error.value = "El nombre es requerido"
    return
  }
  
  if (!nuevoAlumno.value.apellido.trim()) {
    error.value = "El apellido es requerido"
    return
  }
  
  if (!nuevoAlumno.value.fechaPago) {
    error.value = "La fecha de pago es requerida"
    return
  }
  
  // Validar formato de fecha dd/mm/yyyy
  const fechaRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
  if (!fechaRegex.test(nuevoAlumno.value.fechaPago)) {
    error.value = "La fecha debe tener el formato dd/mm/yyyy"
    return
  }
  
  // Convertir fecha string a Date
  const fechaPagoDate = parseDateString(nuevoAlumno.value.fechaPago)
  
  if (!fechaPagoDate || isNaN(fechaPagoDate.getTime())) {
    error.value = "La fecha ingresada no es válida"
    return
  }
  
  // Crear nuevo alumno
  const nuevoId = alumnos.value.length > 0 
    ? Math.max(...alumnos.value.map(a => a.id)) + 1 
    : 1
  
  const alumno = {
    id: nuevoId,
    nombre: nuevoAlumno.value.nombre.trim(),
    apellido: nuevoAlumno.value.apellido.trim(),
    historialPagos: [{
      fecha: fechaPagoDate,
      tipo: "efectivo" // Por defecto
    }]
  }
  
  // Agregar a la lista (en producción, esto sería una llamada a la API)
  alumnos.value.push(alumno)
  
  // Cerrar modal
  closeModal()
}

function openPaymentModal(alumno) {
  alumnoSeleccionado.value = alumno
  showPaymentModal.value = true
  error.value = ""
  nuevoPago.value = {
    fechaPago: "",
    tipoPago: "efectivo"
  }
}

function closePaymentModal() {
  showPaymentModal.value = false
  alumnoSeleccionado.value = null
  error.value = ""
  nuevoPago.value = {
    fechaPago: "",
    tipoPago: "efectivo"
  }
}

function registrarPago() {
  if (!alumnoSeleccionado.value) return
  
  // Validar fecha
  if (!nuevoPago.value.fechaPago) {
    error.value = "La fecha de pago es requerida"
    return
  }
  
  // Validar formato de fecha dd/mm/yyyy
  const fechaRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
  if (!fechaRegex.test(nuevoPago.value.fechaPago)) {
    error.value = "La fecha debe tener el formato dd/mm/yyyy"
    return
  }
  
  // Convertir fecha string a Date
  const fechaPagoDate = parseDateString(nuevoPago.value.fechaPago)
  
  if (!fechaPagoDate || isNaN(fechaPagoDate.getTime())) {
    error.value = "La fecha ingresada no es válida"
    return
  }
  
  // Buscar el alumno en la lista
  const alumnoIndex = alumnos.value.findIndex(a => a.id === alumnoSeleccionado.value.id)
  if (alumnoIndex === -1) return
  
  // Crear nuevo pago
  const nuevoPagoObj = {
    fecha: fechaPagoDate,
    tipo: nuevoPago.value.tipoPago
  }
  
  // Agregar al historial (mantener solo los últimos 3)
  if (!alumnos.value[alumnoIndex].historialPagos) {
    alumnos.value[alumnoIndex].historialPagos = []
  }
  
  alumnos.value[alumnoIndex].historialPagos.push(nuevoPagoObj)
  
  // Ordenar por fecha descendente y mantener solo los últimos 3
  alumnos.value[alumnoIndex].historialPagos.sort((a, b) => 
    new Date(b.fecha) - new Date(a.fecha)
  )
  
  // Mantener solo los últimos 3 pagos
  if (alumnos.value[alumnoIndex].historialPagos.length > 3) {
    alumnos.value[alumnoIndex].historialPagos = alumnos.value[alumnoIndex].historialPagos.slice(0, 3)
  }
  
  // Cerrar modal
  closePaymentModal()
}
</script>

<template>
  <div class="alumnos-container">
    <div class="alumnos-header">
      <div class="header-left">
        <button @click="goBack" class="back-button">←</button>
        <img src="/logo.svg" alt="Potenza Gym Logo" class="logo-small" />
        <div>
          <h1>Alumnos</h1>
          <p class="subtitle">Gestiona tus alumnos y sus pagos</p>
        </div>
      </div>
      <button @click="openModal" class="add-button">
        <span class="add-icon">+</span>
        Nuevo Alumno
      </button>
    </div>

    <div class="alumnos-content">
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

      <div class="alumnos-list">
        <div 
          v-for="alumno in alumnos" 
          :key="alumno.id" 
          class="alumno-card"
        >
          <div class="alumno-info">
            <div class="alumno-name">
              <h3>{{ alumno.nombre }} {{ alumno.apellido }}</h3>
            </div>
            <div class="alumno-payment">
              <p class="payment-label">Último pago:</p>
              <p class="payment-date" v-if="getUltimoPago(alumno)">
                {{ formatDate(getUltimoPago(alumno).fecha) }} 
                <span class="payment-type">({{ getUltimoPago(alumno).tipo }})</span>
              </p>
              <p class="payment-date" v-else>Sin pagos registrados</p>
              <p class="next-payment">Próximo pago: {{ formatNextPaymentDate(alumno) }}</p>
              
              <!-- Botón para ver historial -->
              <button 
                v-if="getUltimosPagos(alumno, 3).length > 0"
                @click="toggleHistorial(alumno.id)" 
                class="history-button"
              >
                {{ isHistorialVisible(alumno.id) ? 'Ocultar' : 'Ver' }} Historial ({{ getUltimosPagos(alumno, 3).length }})
              </button>
            </div>
            
            <!-- Historial de pagos (colapsable) -->
            <div 
              class="payment-history" 
              v-if="getUltimosPagos(alumno, 3).length > 0 && isHistorialVisible(alumno.id)"
            >
              <p class="history-label">Historial de pagos (últimos 3):</p>
              <div class="history-list">
                <div 
                  v-for="(pago, index) in getUltimosPagos(alumno, 3)" 
                  :key="index"
                  class="history-item"
                >
                  <span class="history-date">{{ formatDate(pago.fecha) }}</span>
                  <span class="history-type">{{ pago.tipo }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="alumno-actions">
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
            <button @click="openPaymentModal(alumno)" class="register-payment-button">
              Registrar Pago
            </button>
          </div>
        </div>
      </div>

      <div v-if="alumnos.length === 0" class="empty-state">
        <p>No hay alumnos registrados</p>
      </div>
    </div>

    <!-- Modal para agregar nuevo alumno -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Nuevo Alumno</h2>
          <button @click="closeModal" class="close-button">×</button>
        </div>
        
        <form @submit.prevent="agregarAlumno" class="modal-form">
          <div class="form-group">
            <label for="nombre">Nombre *</label>
            <input
              id="nombre"
              v-model="nuevoAlumno.nombre"
              type="text"
              placeholder="Ingresa el nombre"
              required
            />
          </div>

          <div class="form-group">
            <label for="apellido">Apellido *</label>
            <input
              id="apellido"
              v-model="nuevoAlumno.apellido"
              type="text"
              placeholder="Ingresa el apellido"
              required
            />
          </div>

          <div class="form-group">
            <label for="fechaPago">Fecha de Último Pago * (dd/mm/yyyy)</label>
            <input
              id="fechaPago"
              v-model="nuevoAlumno.fechaPago"
              type="text"
              placeholder="dd/mm/yyyy"
              @input="handleDateInput"
              maxlength="10"
              required
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="cancel-button">
              Cancelar
            </button>
            <button type="submit" class="submit-button">
              Agregar Alumno
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para registrar pago -->
    <div v-if="showPaymentModal && alumnoSeleccionado" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Registrar Pago</h2>
          <button @click="closePaymentModal" class="close-button">×</button>
        </div>
        
        <div class="modal-student-info">
          <p><strong>Alumno:</strong> {{ alumnoSeleccionado.nombre }} {{ alumnoSeleccionado.apellido }}</p>
        </div>
        
        <form @submit.prevent="registrarPago" class="modal-form">
          <div class="form-group">
            <label for="fechaPagoPago">Fecha de Pago * (dd/mm/yyyy)</label>
            <input
              id="fechaPagoPago"
              v-model="nuevoPago.fechaPago"
              type="text"
              placeholder="dd/mm/yyyy"
              @input="handleDateInput"
              maxlength="10"
              required
            />
          </div>

          <div class="form-group">
            <label for="tipoPago">Tipo de Pago *</label>
            <select
              id="tipoPago"
              v-model="nuevoPago.tipoPago"
              required
              class="select-input"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="closePaymentModal" class="cancel-button">
              Cancelar
            </button>
            <button type="submit" class="submit-button">
              Registrar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alumnos-container {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, var(--potenza-light-grey) 0%, var(--potenza-grey-green) 100%);
  padding: 20px;
  padding-bottom: 40px;
}

.alumnos-header {
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

.alumnos-header h1 {
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

.alumnos-content {
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

.alumnos-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alumno-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  border: 2px solid transparent;
  transition: all 0.2s;
  flex-wrap: wrap;
}

.alumno-card:active {
  transform: scale(0.98);
  border-color: var(--potenza-yellow);
}

.alumno-info {
  flex: 1;
}

.alumno-name h3 {
  color: var(--potenza-dark-grey);
  font-size: 1.2rem;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.alumno-payment {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-label {
  color: var(--potenza-grey-green);
  font-size: 0.85rem;
  margin: 0;
  font-weight: 500;
}

.payment-date {
  color: var(--potenza-dark-grey);
  font-size: 0.95rem;
  margin: 0;
  font-weight: 600;
}

.payment-type {
  color: var(--potenza-grey-green);
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.next-payment {
  color: var(--potenza-grey-green);
  font-size: 0.85rem;
  margin: 4px 0 0 0;
}

.history-button {
  margin-top: 12px;
  background-color: var(--potenza-dark-grey);
  color: var(--potenza-yellow);
  border: 2px solid var(--potenza-black);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 36px;
}

.history-button:active {
  transform: scale(0.98);
  background-color: #3A3A3A;
}

.payment-history {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-label {
  color: var(--potenza-dark-grey);
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 0.8rem;
}

.history-date {
  color: var(--potenza-dark-grey);
  font-weight: 500;
}

.history-type {
  color: var(--potenza-grey-green);
  text-transform: capitalize;
  font-size: 0.75rem;
  padding: 2px 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.alumno-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 120px;
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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

.register-payment-button {
  background: linear-gradient(135deg, var(--potenza-yellow) 0%, #FFA500 100%);
  color: var(--potenza-dark-grey);
  border: 2px solid var(--potenza-black);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 40px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.register-payment-button:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.empty-state {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  color: var(--potenza-grey-green);
  font-size: 1rem;
}

.modal-student-info {
  padding: 16px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.modal-student-info p {
  margin: 0;
  color: var(--potenza-dark-grey);
  font-size: 1rem;
}

.select-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%232D2D2D' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.select-input:focus {
  outline: none;
  border-color: var(--potenza-yellow);
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.15);
}

.add-button {
  background: linear-gradient(135deg, var(--potenza-yellow) 0%, #FFA500 100%);
  color: var(--potenza-dark-grey);
  border: 2px solid var(--potenza-black);
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.add-button:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.add-icon {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  -webkit-overflow-scrolling: touch;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--potenza-yellow);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid var(--potenza-yellow);
}

.modal-header h2 {
  color: var(--potenza-dark-grey);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: var(--potenza-dark-grey);
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.close-button:active {
  background-color: #f3f4f6;
  transform: scale(0.95);
}

.modal-form {
  padding: 24px;
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
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--potenza-dark-grey);
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.2s;
  -webkit-appearance: none;
  appearance: none;
}

.form-group input:focus {
  outline: none;
  border-color: var(--potenza-yellow);
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.15);
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.cancel-button {
  flex: 1;
  background-color: var(--potenza-dark-grey);
  color: var(--potenza-yellow);
  border: 2px solid var(--potenza-black);
  padding: 14px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
}

.cancel-button:active {
  transform: scale(0.98);
  background-color: #3A3A3A;
}

.submit-button {
  flex: 1;
  background: linear-gradient(135deg, var(--potenza-yellow) 0%, #FFA500 100%);
  color: var(--potenza-dark-grey);
  border: 2px solid var(--potenza-black);
  padding: 14px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.submit-button:active {
  transform: scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@media (min-width: 480px) {
  .alumno-card {
    padding: 24px;
  }
  
  .add-button {
    padding: 12px 24px;
  }
}
</style>
