import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useNavigate } from 'react-router-dom'
import { Content } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import {
  useCreateSaleMutation,
  useGetCounterpartiesQuery,
  useGetOrderByIdQuery,
  useGetSalesQuery,
  useGetStockQuery,
  useUpdateOrderMutation
} from '../store/api'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('uk-UA')

const formatMoney = (cents: number) => `${(cents / 100).toFixed(2)} грн`

const parseMoneyToCents = (value: string) => {
  const normalized = value.replace(',', '.').trim()
  if (!normalized) return 0
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100)
}

type ItemRow = {
  rowId: string
  productId: string
  quantity: string
  price: string
}

export const SalesPage = () => {
  const navigate = useNavigate()
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
  const [items, setItems] = useState<ItemRow[]>([
    { rowId: 'row-1', productId: '', quantity: '1', price: '' }
  ])
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

  const totalCents = useMemo(
    () =>
      items.reduce((sum, item) => {
        const qty = Number(item.quantity)
        if (!item.productId || Number.isNaN(qty) || qty <= 0) {
          return sum
        }
        return sum + parseMoneyToCents(item.price) * qty
      }, 0),
    [items]
  )

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { rowId: `row-${prev.length + 1}`, productId: '', quantity: '1', price: '' }
    ])
  }

  const removeRow = (rowId: string) => {
    setItems((prev) => prev.filter((item) => item.rowId !== rowId))
  }

  const updateRow = (rowId: string, patch: Partial<ItemRow>) => {
    setItems((prev) =>
      prev.map((item) => (item.rowId === rowId ? { ...item, ...patch } : item))
    )
  }

  const handleCreate = async () => {
    setFormError(null)
    setStockWarning(null)
    if (!customerId) {
      setFormError('Оберіть клієнта')
      return
    }
    const preparedItems = items
      .map((item) => ({
        productId: item.productId || undefined,
        quantity: Number(item.quantity),
        priceCents: parseMoneyToCents(item.price)
      }))
      .filter(
        (item): item is { productId: string; quantity: number; priceCents: number } =>
          Boolean(item.productId) && item.quantity > 0
      )

    if (preparedItems.length === 0) {
      setFormError('Додайте хоча б один товар')
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
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? (err as { status?: number }).status
          : undefined
      if (status === 409) {
        setStockWarning('Недостатньо залишку для продажу')
      }
      return
    }

    setCustomerId('')
    setOrderDate('')
    setEditingId(null)
    setItems([{ rowId: 'row-1', productId: '', quantity: '1', price: '' }])
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
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Клієнт"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              fullWidth
            >
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Дата"
              type="date"
              value={orderDate}
              onChange={(event) => setOrderDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Товар</TableCell>
                <TableCell>К-сть</TableCell>
                <TableCell>Ціна (грн)</TableCell>
                <TableCell>Сума</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const qty = Number(item.quantity)
                const rowTotal =
                  item.productId && qty > 0 ? parseMoneyToCents(item.price) * qty : 0
                return (
                  <TableRow key={item.rowId}>
                    <TableCell>
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
                    <TableCell>
                      <TextField
                        value={item.quantity}
                        onChange={(event) =>
                          updateRow(item.rowId, { quantity: event.target.value })
                        }
                        inputMode="numeric"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.price}
                        onChange={(event) =>
                          updateRow(item.rowId, { price: event.target.value })
                        }
                        inputMode="decimal"
                      />
                    </TableCell>
                    <TableCell>{formatMoney(rowTotal)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeRow(item.rowId)}
                        disabled={items.length === 1}
                      >
                        <DeleteForeverOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="outlined" onClick={addRow}>
              Додати позицію
            </Button>
            <Typography variant="subtitle2">Разом: {formatMoney(totalCents)}</Typography>
          </Stack>

          {formError && <Alert severity="warning">{formError}</Alert>}
          {stockWarning && <Alert severity="error">{stockWarning}</Alert>}
          {createError && <Alert severity="error">Не вдалося створити продаж</Alert>}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={async () => {
                if (editingId) {
                  setFormError(null)
                  if (!customerId) {
                    setFormError('Оберіть клієнта')
                    return
                  }
                  const preparedItems = items
                    .map((item) => ({
                      productId: item.productId || undefined,
                      quantity: Number(item.quantity),
                      priceCents: parseMoneyToCents(item.price)
                    }))
                    .filter(
                      (item): item is {
                        productId: string
                        quantity: number
                        priceCents: number
                      } => Boolean(item.productId) && item.quantity > 0
                    )

                  if (preparedItems.length === 0) {
                    setFormError('Додайте хоча б один товар')
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
                    const status =
                      typeof err === 'object' && err !== null && 'status' in err
                        ? (err as { status?: number }).status
                        : undefined
                    if (status === 409) {
                      setStockWarning('Недостатньо залишку для продажу')
                    }
                    return
                  }
                  setEditingId(null)
                } else {
                  await handleCreate()
                }
              }}
              disabled={isCreating || isUpdating}
            >
              {editingId
                ? isUpdating
                  ? 'Оновлюю...'
                  : 'Зберегти зміни'
                : isCreating
                  ? 'Зберігаю...'
                  : 'Створити документ'}
            </Button>
            {editingId && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingId(null)
                  setCustomerId('')
                  setOrderDate('')
                  setItems([{ rowId: 'row-1', productId: '', quantity: '1', price: '' }])
                }}
              >
                Скасувати
              </Button>
            )}
          </Stack>
        </Stack>
      </SectionCard>

      <SectionCard>
        <Typography variant="h6">Продажі</Typography>
        {isLoading && <CircularProgress size={28} />}
        {isError && <Alert severity="error">Не вдалося завантажити продажі</Alert>}
        {!isLoading && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Номер документа</TableCell>
                <TableCell>Клієнт</TableCell>
                <TableCell>Сума</TableCell>
                <TableCell>Валюта</TableCell>
                <TableCell>Деталі</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>
                    {order.documentNumber ?? order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell>{order.counterparty?.name ?? '—'}</TableCell>
                  <TableCell>{formatMoney(order.totalCents)}</TableCell>
                  <TableCell>UAH</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/sales/${order.id}`)}>
                      Відкрити
                    </Button>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => setEditingId(order.id)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>Немає даних</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </Content>
  )
}
