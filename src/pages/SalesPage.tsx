import { useEffect, useMemo, useState } from 'react'
import {
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { Content } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import { OrderFormActions } from '../components/orders/OrderFormActions'
import { OrderFormAlerts } from '../components/orders/OrderFormAlerts'
import { OrderFormHeader } from '../components/orders/OrderFormHeader'
import { OrderItemsFooter } from '../components/orders/OrderItemsFooter'
import { OrderItemQuantityPrice } from '../components/orders/OrderItemQuantityPrice'
import { OrdersTable } from '../components/orders/OrdersTable'
import { RemoveRowButton } from '../components/orders/RemoveRowButton'
import {
  useCreateSaleMutation,
  useGetCounterpartiesQuery,
  useGetOrderByIdQuery,
  useGetSalesQuery,
  useGetStockQuery,
  useUpdateOrderMutation
} from '../store/api'
import {
  ERR_NO_ITEMS,
  handleOrderApiError,
  prepareOrderItems
} from '../utils/order'
import { formatMoney, parseMoneyToCents } from '../utils/money'
import { useOrderItems, type BaseItemRow } from '../hooks/useOrderItems'
import { TABLE_HEADERS } from '../constants/labels'
import { ERROR_MESSAGES } from '../constants/messages'

type ItemRow = BaseItemRow & {
  productId: string
}

export const SalesPage = () => {
  const { data = [], isLoading, isError } = useGetSalesQuery()
  const { data: stock = [] } = useGetStockQuery()
  const { data: customers = [] } = useGetCounterpartiesQuery({
    type: 'CUSTOMER',
    includeInactive: false
  })
  const [createSale, { isLoading: isCreating, error: createError }] =
    useCreateSaleMutation()
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation()

  const [customerId, setCustomerId] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const { items, setItems, addRow, removeRow, updateRow, totalCents, resetItems } =
    useOrderItems<ItemRow>(() => ({
      rowId: '',
      productId: '',
      quantity: '1',
      price: ''
    }))
  const [formError, setFormError] = useState<string | null>(null)
  const [stockWarning, setStockWarning] = useState<string | null>(null)
  const { data: editingOrder } = useGetOrderByIdQuery(editingId ?? '', {
    skip: !editingId
  })

  const stockMap = useMemo(() => {
    const map = new Map<string, { name: string; details: string; availableQty: number }>()
    stock.forEach((item) => {
      const details =
        item.product.category?.name === 'Шини'
          ? `${item.product.tireDetails?.size || ''} ${
              item.product.tireDetails?.loadIndex?.code || ''
            }${item.product.tireDetails?.speedIndex?.code || ''} ${
              item.product.tireDetails?.isXL ? 'XL' : ''
            } ${item.product.tireDetails?.isRunFlat ? 'RunFlat' : ''}`.trim()
          : `${item.product.autoDetails?.subcategory?.name || ''} ${
              item.product.autoDetails?.brand || ''
            } ${item.product.autoDetails?.model || ''}`.trim()

      map.set(item.product.id, {
        name: item.product.name,
        details,
        availableQty: item.availableQty
      })
    })
    return map
  }, [stock])

  const inStockOptions = useMemo(
    () =>
      stock
        .filter((item) => item.availableQty > 0)
        .map((item) => ({
          id: item.product.id,
          label: `${item.product.name} ${stockMap.get(item.product.id)?.details || ''}`.trim(),
          availableQty: item.availableQty
        })),
    [stock, stockMap]
  )

  const allOptions = useMemo(() => {
    const map = new Map<string, { label: string; availableQty: number }>()
    inStockOptions.forEach((option) => {
      map.set(option.id, { label: option.label, availableQty: option.availableQty })
    })
    items.forEach((item) => {
      if (!item.productId || map.has(item.productId)) return
      const info = stockMap.get(item.productId)
      if (info) {
        map.set(item.productId, {
          label: `${info.name} ${info.details}`.trim(),
          availableQty: info.availableQty
        })
      }
    })
    return Array.from(map.entries()).map(([id, value]) => ({ id, ...value }))
  }, [inStockOptions, items, stockMap])

  const stockInfoByProductId = useMemo(() => {
    const map = new Map<string, { label: string; availableQty: number }>()
    allOptions.forEach((option) => {
      map.set(option.id, { label: option.label, availableQty: option.availableQty })
    })
    return map
  }, [allOptions])


  const mapItemToPrepared = (item: ItemRow) => {
    const quantity = Math.max(0, Number(item.quantity) || 0)
    const priceCents = Math.max(0, parseMoneyToCents(item.price))

    return {
      productId: item.productId || undefined,
      quantity,
      priceCents
    }
  }

  const validateStockForItems = () => {
    const violations: string[] = []

    items.forEach((item) => {
      if (!item.productId) return
      const qty = Math.max(0, Number(item.quantity) || 0)
      if (qty === 0) return
      const info = stockInfoByProductId.get(item.productId)
      if (!info) return
      if (qty > info.availableQty) {
        violations.push(
          `${info.label} (доступно: ${info.availableQty}, вказано: ${qty})`
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
  }

  const handleCreate = async () => {
    setFormError(null)
    setStockWarning(null)
    if (!customerId) {
      setFormError('Оберіть клієнта')
      return
    }
    if (!validateStockForItems()) {
      return
    }
    const preparedItems = prepareOrderItems(items, mapItemToPrepared)
    if (preparedItems.length === 0) {
      setFormError(ERR_NO_ITEMS)
      return
    }

    try {
      await createSale({
        type: 'SALE',
        counterpartyId: customerId,
        orderDate: orderDate || undefined,
        items: preparedItems
      }).unwrap()
    } catch (err: unknown) {
      handleOrderApiError(err, setStockWarning)
      return
    }

    setCustomerId('')
    setOrderDate('')
    setEditingId(null)
    resetItems()
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setFormError(null)
    setStockWarning(null)
    if (!customerId) {
      setFormError('Оберіть клієнта')
      return
    }
    if (!validateStockForItems()) {
      return
    }
    const preparedItems = prepareOrderItems(items, mapItemToPrepared)
    if (preparedItems.length === 0) {
      setFormError(ERR_NO_ITEMS)
      return
    }

    try {
      await updateOrder({
        id: editingId,
        type: 'SALE',
        counterpartyId: customerId,
        orderDate: orderDate || undefined,
        items: preparedItems
      }).unwrap()
    } catch (err: unknown) {
      handleOrderApiError(err, setStockWarning)
      return
    }
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (editingId) {
      await handleUpdate()
    } else {
      await handleCreate()
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setCustomerId('')
    setOrderDate('')
    resetItems()
  }

  useEffect(() => {
    if (!editingOrder) return
    setCustomerId(editingOrder.counterparty?.id ?? '')
    setOrderDate(editingOrder.orderDate?.slice(0, 10) ?? '')
    const mappedItems =
      editingOrder.items?.map((item) => ({
        rowId: item.id,
        productId: item.product.id,
        quantity: String(item.quantity),
        price: (item.priceCents / 100).toFixed(2)
      })) ?? []

    setItems(
      mappedItems.length > 0
        ? mappedItems
        : [{ rowId: 'row-1', productId: '', quantity: '1', price: '' }]
    )
  }, [editingOrder])

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6">Новий продаж</Typography>
        <Stack spacing={2}>
          <OrderFormHeader
            counterpartyLabel="Клієнт"
            counterpartyId={customerId}
            onCounterpartyChange={setCustomerId}
            orderDate={orderDate}
            onOrderDateChange={setOrderDate}
            counterpartyOptions={customers}
          />

          <TableContainer>
            <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '46%' }}>{TABLE_HEADERS.product}</TableCell>
                  <TableCell sx={{ width: '10%' }}>{TABLE_HEADERS.quantity}</TableCell>
                  <TableCell sx={{ width: '19%' }}>{TABLE_HEADERS.price}</TableCell>
                  <TableCell sx={{ width: '15%' }}>{TABLE_HEADERS.amount}</TableCell>
                  <TableCell sx={{ width: '10%' }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const qty = Number(item.quantity)
                  const rowTotal =
                    item.productId && qty > 0 ? parseMoneyToCents(item.price) * qty : 0
                  const stockInfo = item.productId
                    ? stockInfoByProductId.get(item.productId)
                    : undefined
                  const availableQty = stockInfo?.availableQty
                  const quantityError =
                    typeof availableQty === 'number' && availableQty >= 0 && qty > availableQty
                      ? `Недостатньо залишку (доступно: ${availableQty})`
                      : null

                  return (
                    <TableRow
                      key={item.rowId}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          select
                          value={item.productId}
                          onChange={(event) =>
                            updateRow(item.rowId, { productId: event.target.value })
                          }
                          fullWidth
                        >
                          {allOptions.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.label} (залишок: {option.availableQty})
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <OrderItemQuantityPrice
                        quantity={item.quantity}
                        price={item.price}
                        onQuantityChange={(value: string) =>
                          updateRow(item.rowId, { quantity: value })
                        }
                        onPriceChange={(value: string) =>
                          updateRow(item.rowId, { price: value })
                        }
                        maxQuantity={availableQty}
                        quantityError={quantityError}
                      />
                      <TableCell sx={{ py: 1.5 }}>{formatMoney(rowTotal)}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <RemoveRowButton
                          onRemove={() => removeRow(item.rowId)}
                          disabled={items.length === 1}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <OrderItemsFooter onAddRow={addRow} totalCents={totalCents} />

          <OrderFormAlerts
            formError={formError}
            stockWarning={stockWarning}
            createError={createError}
            createErrorMessage={ERROR_MESSAGES.createSale}
          />
          <OrderFormActions
            onSubmit={handleSubmit}
            onCancel={editingId ? handleCancel : undefined}
            isEditing={Boolean(editingId)}
            isCreating={isCreating}
            isUpdating={isUpdating}
          />
        </Stack>
      </SectionCard>

      <SectionCard>
        <Typography variant="h6">Продажі</Typography>
        <OrdersTable
          orders={data}
          isLoading={isLoading}
          isError={isError}
          basePath="/sales"
          counterpartyColumnLabel="Клієнт"
          onEdit={setEditingId}
        />
      </SectionCard>
    </Content>
  )
}
