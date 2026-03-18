import { getHttpStatus } from './httpError'

export type OrderItemInput = {
  productId: string
  quantity: number
  priceCents: number
}

export const ERR_NO_ITEMS = 'Додайте хоча б один товар'
export const ERR_STOCK =
  'Недостатньо залишку: операція призведе до від’ємного залишку. Перевірте документи продажу та закупки.'

export function prepareOrderItems<T>(
  items: T[],
  map: (item: T) => {
    productId: string | undefined
    quantity: number
    priceCents: number
  }
): OrderItemInput[] {
  return items
    .map(map)
    .filter(
      (item): item is OrderItemInput =>
        Boolean(item.productId) && item.quantity > 0 && item.priceCents >= 0
    )
}

export function handleOrderApiError(
  err: unknown,
  setStockWarning: (msg: string) => void
): void {
  if (getHttpStatus(err) === 409) {
    setStockWarning(ERR_STOCK)
  }
}
