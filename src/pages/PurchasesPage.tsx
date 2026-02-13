import { useMemo, useState } from 'react'
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
import { useNavigate } from 'react-router-dom'
import { Content } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import {
  useCreatePurchaseMutation,
  useGetCounterpartiesQuery,
  useGetProductsQuery,
  useGetPurchasesQuery
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

export const PurchasesPage = () => {
  const navigate = useNavigate()
  const { data = [], isLoading, isError } = useGetPurchasesQuery()
  const { data: products = [] } = useGetProductsQuery()
  const { data: suppliers = [] } = useGetCounterpartiesQuery({
    type: 'SUPPLIER',
    includeInactive: false
  })
  const [createPurchase, { isLoading: isCreating, error: createError }] =
    useCreatePurchaseMutation()

  const [supplierId, setSupplierId] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [items, setItems] = useState<ItemRow[]>([
    { rowId: 'row-1', productId: '', quantity: '1', price: '' }
  ])
  const [formError, setFormError] = useState<string | null>(null)

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
    if (!supplierId) {
      setFormError('Оберіть постачальника')
      return
    }
    const preparedItems = items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        priceCents: parseMoneyToCents(item.price)
      }))
      .filter((item) => item.quantity > 0)

    if (preparedItems.length === 0) {
      setFormError('Додайте хоча б один товар')
      return
    }

    await createPurchase({
      type: 'PURCHASE',
      counterpartyId: supplierId,
      orderDate: orderDate || undefined,
      items: preparedItems
    }).unwrap()

    setSupplierId('')
    setOrderDate('')
    setItems([{ rowId: 'row-1', productId: '', quantity: '1', price: '' }])
  }

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6">Нова закупка</Typography>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Постачальник"
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
              fullWidth
            >
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
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
                  item.productId && qty > 0
                    ? parseMoneyToCents(item.price) * qty
                    : 0
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
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name}
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
          {createError && <Alert severity="error">Не вдалося створити закупку</Alert>}
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? 'Зберігаю...' : 'Створити документ'}
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard>
        <Typography variant="h6">Закупки</Typography>
        {isLoading && <CircularProgress size={28} />}
        {isError && <Alert severity="error">Не вдалося завантажити закупки</Alert>}
        {!isLoading && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Номер документа</TableCell>
                <TableCell>Постачальник</TableCell>
                <TableCell>Сума</TableCell>
                <TableCell>Валюта</TableCell>
                <TableCell>Деталі</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatDate(order.orderDate)}</TableCell>
                  <TableCell>{order.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>{order.counterparty?.name ?? '—'}</TableCell>
                  <TableCell>{formatMoney(order.totalCents)}</TableCell>
                  <TableCell>UAH</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/purchases/${order.id}`)}
                    >
                      Відкрити
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>Немає даних</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </Content>
  )
}
