import { useMemo, useState } from 'react'
import { parseMoneyToCents } from '../utils/money'

export type BaseItemRow = {
  rowId: string
  quantity: string
  price: string
}

export function useOrderItems<T extends BaseItemRow>(initialRow: () => T) {
  const [rowCounter, setRowCounter] = useState(2)
  const initial = initialRow()
  initial.rowId = 'row-1'
  const [items, setItems] = useState<T[]>([initial])

  const addRow = () => {
    setItems((prev) => {
      const newRow = initialRow()
      newRow.rowId = `row-${rowCounter}`
      setRowCounter((c) => c + 1)
      return [...prev, newRow]
    })
  }

  const removeRow = (rowId: string) => {
    setItems((prev) => prev.filter((item) => item.rowId !== rowId))
  }

  const updateRow = (rowId: string, patch: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.rowId === rowId ? { ...item, ...patch } : item))
    )
  }

  const totalCents = useMemo(
    () =>
      items.reduce((sum, item) => {
        const qty = Number(item.quantity)
        if (Number.isNaN(qty) || qty <= 0) {
          return sum
        }
        return sum + parseMoneyToCents(item.price) * qty
      }, 0),
    [items]
  )

  const resetItems = () => {
    const newRow = initialRow()
    newRow.rowId = 'row-1'
    setItems([newRow])
    setRowCounter(2)
  }

  return {
    items,
    setItems,
    addRow,
    removeRow,
    updateRow,
    totalCents,
    resetItems
  }
}
