import type { Counterparty } from './counterparty'
import type { Product } from './product'

export type OrderItem = {
  id: string
  quantity: number
  priceCents: number
  product: Product
}

export type CreateOrderItemInput = {
  productId: string
  quantity: number
  priceCents: number
}

export type Order = {
  id: string
  type: 'PURCHASE' | 'SALE'
  status: 'DRAFT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  orderDate: string
  totalCents: number
  counterparty?: Counterparty | null
  items?: OrderItem[]
}

export type CreatePurchaseInput = {
  type: 'PURCHASE'
  counterpartyId: string
  orderDate?: string
  items: CreateOrderItemInput[]
}
