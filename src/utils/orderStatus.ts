import type { Order } from '../types/order'

export const getStatusLabel = (status: Order['status']): string => {
  const labels: Record<Order['status'], string> = {
    DRAFT: 'Чернетка',
    CONFIRMED: 'Підтверджено',
    COMPLETED: 'Виконано',
    CANCELLED: 'Скасовано'
  }
  return labels[status]
}

export const getStatusColor = (
  status: Order['status']
): 'default' | 'primary' | 'success' | 'error' => {
  const colors: Record<Order['status'], 'default' | 'primary' | 'success' | 'error'> = {
    DRAFT: 'default',
    CONFIRMED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error'
  }
  return colors[status]
}

export const getAvailableTransitions = (
  currentStatus: Order['status']
): Array<'CONFIRMED' | 'COMPLETED' | 'CANCELLED'> => {
  const transitions: Record<
    Order['status'],
    Array<'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>
  > = {
    DRAFT: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: []
  }
  return transitions[currentStatus]
}

export const transitionLabel = (
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
): string => {
  const map = {
    CONFIRMED: 'Підтвердити',
    COMPLETED: 'Виконати',
    CANCELLED: 'Скасувати'
  }
  return map[status]
}

export const canEditOrder = (status: Order['status']): boolean =>
  status !== 'COMPLETED' && status !== 'CANCELLED'
