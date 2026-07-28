/** Etiquetas legibles para estados crudos de la API */

const RESERVATION_STATUS = {
  pendiente: 'Pendiente de pago',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

const PAYMENT_STATUS = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  reembolsado: 'Reembolsado',
  rechazado: 'Rechazado',
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

export const formatNotificationType = (type) =>
  NOTIFICATION_TYPE[type] || type || 'Aviso'
