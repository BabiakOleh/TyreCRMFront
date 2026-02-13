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
  documentNumber?: string | null
  type: 'PURCHASE' | 'SALE'
  status: 'DRAFT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  orderDate: string
  totalCents: number
  counterparty?: Counterparty | null
  items?: OrderItem[]
}

export type CreatePurchaseInput = {
  type: 'PURCHASE'
  documentNumber?: string
  counterpartyId: string
  orderDate?: string
  items: CreateOrderItemInput[]
}

export type CreateSaleInput = {
  type: 'SALE'
  documentNumber?: string
  counterpartyId: string
  orderDate?: string
  items: CreateOrderItemInput[]
}

export type UpdateOrderInput = (CreatePurchaseInput | CreateSaleInput) & {
  id: string
}
