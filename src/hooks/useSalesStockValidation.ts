import { useCallback } from 'react'
import type { SalesStockValidationParams } from '../types/sales'

export const useSalesStockValidation = ({
  items,
  stockInfoByProductId,
  editingId,
  editingOrder,
  setStockWarning
}: SalesStockValidationParams) => {
  const getOriginalQty = useCallback(
    (productId: string | undefined) => {
      if (!editingId || !editingOrder || !productId) return 0
      const orderItem = editingOrder.items?.find(
        (item) => item.product.id === productId
      )
      return orderItem?.quantity ?? 0
    },
    [editingId, editingOrder]
  )

  const getMaxAllowedQty = useCallback(
    (productId: string | undefined, availableQty?: number) => {
      if (typeof availableQty !== 'number' || availableQty < 0) return undefined
      if (!editingId || !productId) {
        return availableQty
      }
      const originalQty = getOriginalQty(productId)
      return originalQty + availableQty
    },
    [editingId, getOriginalQty]
  )

  const validateStockForItems = useCallback(() => {
    const violations: string[] = []

    items.forEach((item) => {
      if (!item.productId) return
      const qty = Math.max(0, Number(item.quantity) || 0)
      if (qty === 0) return
      const info = stockInfoByProductId.get(item.productId)
      if (!info) return

      const maxAllowedQty = getMaxAllowedQty(item.productId, info.availableQty)

      if (typeof maxAllowedQty === 'number' && qty > maxAllowedQty) {
        violations.push(
          `${info.label} (доступно: ${info.availableQty}, максимум: ${maxAllowedQty}, вказано: ${qty})`
        )
      }
    })

    if (violations.length > 0) {
      setStockWarning(
        `Недостатньо залишку для таких позицій:\n${violations.join('\n')}`
      )
      return false
    }

    return true
  }, [getMaxAllowedQty, items, setStockWarning, stockInfoByProductId])

  return {
    getMaxAllowedQty,
    validateStockForItems
  }
}

