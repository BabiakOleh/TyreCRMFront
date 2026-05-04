import { useEffect, useMemo, useState } from 'react'
import { MenuItem, Stack, TableCell, TextField, Typography } from '@mui/material'
import { Content } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import { OrderFormActions } from '../components/orders/OrderFormActions'
import { OrderFormAlerts } from '../components/orders/OrderFormAlerts'
import { OrderFormHeader } from '../components/orders/OrderFormHeader'
import { OrderItemsFooter } from '../components/orders/OrderItemsFooter'
import { OrderItemsTable } from '../components/orders/OrderItemsTable'
import { OrdersTable } from '../components/orders/OrdersTable'
import {
  useCreatePurchaseMutation,
  useGetCounterpartiesQuery,
  useGetOrderByIdQuery,
  useGetProductsQuery,
  useGetPurchasesQuery,
  useUpdateOrderMutation
} from '../store/api'
import { ERR_NO_ITEMS, handleOrderApiError, prepareOrderItems } from '../utils/order'
import { formatMoney, parseMoneyToCents } from '../utils/money'
import { useOrderItems, type BaseItemRow } from '../hooks/useOrderItems'
import { TABLE_HEADERS } from '../constants/labels'
import { ERROR_MESSAGES } from '../constants/messages'
import { canEditOrder } from '../utils/orderStatus'

type ItemRow = BaseItemRow & {
  productId: string
}

export const PurchasesPage = () => {
  const { data = [], isLoading, isError } = useGetPurchasesQuery()
  const { data: products = [] } = useGetProductsQuery()
  const { data: suppliers = [] } = useGetCounterpartiesQuery({
    type: 'SUPPLIER',
    includeInactive: false
  })
  const [createPurchase, { isLoading: isCreating, error: createError }] =
    useCreatePurchaseMutation()
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation()

  const [supplierId, setSupplierId] = useState('')
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
  const activeSuppliers = useMemo(
    () => suppliers.filter((supplier) => supplier.isActive),
    [suppliers]
  )

  const productOptions = useMemo(
    () =>
      products.map((product) => {
        const details =
          product.category?.name === 'Шини'
            ? `${product.tireDetails?.size || ''} ${
                product.tireDetails?.loadIndex?.code || ''
              }${product.tireDetails?.speedIndex?.code || ''} ${
                product.tireDetails?.isXL ? 'XL' : ''
              } ${product.tireDetails?.isRunFlat ? 'RunFlat' : ''}`.trim()
            : `${product.autoDetails?.subcategory?.name || ''} ${
                product.autoDetails?.brand || ''
              } ${product.autoDetails?.model || ''}`.trim()

        return {
          id: product.id,
          label: `${product.name} ${details}`.trim()
        }
      }),
    [products]
  )

  const mapItemToPrepared = (item: ItemRow) => {
    const quantity = Math.max(0, Number(item.quantity) || 0)
    const priceCents = Math.max(0, parseMoneyToCents(item.price))

    return {
      productId: item.productId || undefined,
      quantity,
      priceCents
    }
  }

  const handleCreate = async () => {
    setFormError(null)
    setStockWarning(null)
    if (!supplierId) {
      setFormError('Оберіть постачальника')
      return
    }
    const preparedItems = prepareOrderItems(items, mapItemToPrepared)
    if (preparedItems.length === 0) {
      setFormError(ERR_NO_ITEMS)
      return
    }

    try {
      await createPurchase({
        type: 'PURCHASE',
        counterpartyId: supplierId,
        orderDate: orderDate || undefined,
        items: preparedItems
      }).unwrap()
    } catch (err: unknown) {
      handleOrderApiError(err, setStockWarning)
      return
    }

    setSupplierId('')
    setOrderDate('')
    setEditingId(null)
    resetItems()
  }

  const handleUpdate = async () => {
    if (!editingId) return
    setFormError(null)
    if (!supplierId) {
      setFormError('Оберіть постачальника')
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
        type: 'PURCHASE',
        counterpartyId: supplierId,
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
    setSupplierId('')
    setOrderDate('')
    resetItems()
  }

  useEffect(() => {
    if (editingId && editingOrder && !canEditOrder(editingOrder.status)) {
      setEditingId(null)
      setSupplierId('')
      setOrderDate('')
      resetItems()
    }
  }, [editingId, editingOrder, resetItems])

  useEffect(() => {
    if (!editingOrder) return
    setSupplierId(editingOrder.counterparty?.id ?? '')
    setOrderDate(editingOrder.orderDate?.slice(0, 10) ?? '')
    const mappedItems: ItemRow[] =
      editingOrder.items?.map((item) => ({
        rowId: item.id,
        productId: item.product.id,
        quantity: String(item.quantity),
        price: (item.priceCents / 100).toFixed(2)
      })) ?? []

    setItems(
      mappedItems.length > 0
        ? mappedItems
        : [
            {
              rowId: 'row-1',
              productId: '',
              quantity: '1',
              price: ''
            }
          ]
    )
  }, [editingOrder])

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6">
          {editingId && editingOrder
            ? `Редагування документу №${
                editingOrder.documentNumber ??
                editingOrder.id.slice(0, 8).toUpperCase()
              }`
            : 'Нова закупка'}
        </Typography>
        <Stack spacing={2}>
          <OrderFormHeader
            counterpartyLabel="Постачальник"
            counterpartyId={supplierId}
            onCounterpartyChange={setSupplierId}
            orderDate={orderDate}
            onOrderDateChange={setOrderDate}
            counterpartyOptions={activeSuppliers}
          />

          <OrderItemsTable
            items={items}
            canRemove={items.length > 1}
            renderLeadingCells={(item) => (
              <TableCell sx={{ py: 1.5 }}>
                <TextField
                  select
                  value={item.productId}
                  onChange={(event) =>
                    updateRow(item.rowId, { productId: event.target.value })
                  }
                  fullWidth
                >
                  {productOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
            )}
            getRowTotalCents={(item) => {
              const qty = Number(item.quantity)
              return qty > 0 ? parseMoneyToCents(item.price) * qty : 0
            }}
            onQuantityChange={(rowId, value) =>
              updateRow(rowId, { quantity: value })
            }
            onPriceChange={(rowId, value) => updateRow(rowId, { price: value })}
            onRemove={removeRow}
          />

          <OrderItemsFooter onAddRow={addRow} totalCents={totalCents} />

          <OrderFormAlerts
            formError={formError}
            stockWarning={stockWarning}
            createError={createError}
            createErrorMessage={ERROR_MESSAGES.createPurchase}
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
        <Typography variant="h6">Закупки</Typography>
        <OrdersTable
          orders={data}
          isLoading={isLoading}
          isError={isError}
          basePath="/purchases"
          counterpartyColumnLabel="Постачальник"
          onEdit={(id) => {
            const o = data.find((x) => x.id === id)
            if (!o || !canEditOrder(o.status)) return
            setEditingId(id)
          }}
        />
      </SectionCard>
    </Content>
  )
}
