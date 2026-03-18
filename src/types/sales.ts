import type { Order } from './order'
import type { BaseItemRow } from '../hooks/useOrderItems'

export type SalesItemRow = BaseItemRow & {
  productId: string
}

export type SalesStockInfo = {
  label: string
  availableQty: number
}

export type SalesStockValidationParams = {
  items: SalesItemRow[]
  stockInfoByProductId: Map<string, SalesStockInfo>
  editingId: string | null
  editingOrder?: Order
  setStockWarning: (message: string | null) => void
}

