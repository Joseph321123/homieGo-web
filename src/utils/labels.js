/** Etiquetas legibles para estados crudos de la API */

const RESERVATION_STATUS = {
  pendiente: 'Esperando anfitrión',
  aceptada: 'Aceptada · pendiente de pago',
  confirmada: 'Confirmada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

const PAYMENT_STATUS = {
  pendiente: 'Pendiente',
  retenido: 'Retenido (escrow)',
  liberado: 'Liberado al anfitrión',
  aprobado: 'Aprobado',
  reembolsado: 'Reembolsado',
  rechazado: 'Rechazado',
}

const IDENTITY_STATUS = {
  no_requerida: 'No requerida',
  pendiente: 'Pendiente de verificación',
  verificada: 'Verificada',
  rechazada: 'Rechazada',
}

const NOTIFICATION_TYPE = {
  reserva: 'Reserva',
  pago: 'Pago',
  mensaje: 'Mensaje',
  resena: 'Reseña',
  cancelacion: 'Cancelación',
}

export const formatReservationStatus = (status) =>
  RESERVATION_STATUS[status] || status || 'Sin estado'

export const formatPaymentStatus = (status) =>
  PAYMENT_STATUS[status] || status || 'N/A'

export const formatIdentityStatus = (status) =>
  IDENTITY_STATUS[status] || status || 'Sin estado'

export const formatNotificationType = (type) =>
  NOTIFICATION_TYPE[type] || type || 'Aviso'
