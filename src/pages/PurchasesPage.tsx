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
  useCreatePurchaseMutation,
  useGetCounterpartiesQuery,
  useGetOrderByIdQuery,
  useGetProductsQuery,
  useGetPurchasesQuery,
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

const CATEGORY_TIRE = 'Шини'

type ItemRow = {
  rowId: string
  kind: 'TIRE' | 'AUTO'
  tireDetailKey: string
  tireBrandId: string
  tireModelId: string
  autoSubcategoryId: string
  autoBrand: string
  autoModel: string
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
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation()

  const [supplierId, setSupplierId] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [items, setItems] = useState<ItemRow[]>([
    {
      rowId: 'row-1',
      kind: 'TIRE',
      tireDetailKey: '',
      tireBrandId: '',
      tireModelId: '',
      autoSubcategoryId: '',
      autoBrand: '',
      autoModel: '',
      quantity: '1',
      price: ''
    }
  ])
  const [formError, setFormError] = useState<string | null>(null)
  const [stockWarning, setStockWarning] = useState<string | null>(null)
  const { data: editingOrder } = useGetOrderByIdQuery(editingId ?? '', {
    skip: !editingId
  })
  const activeSuppliers = useMemo(
    () => suppliers.filter((supplier) => supplier.isActive),
    [suppliers]
  )

  const tireProducts = useMemo(
    () => products.filter((product) => product.category?.name === CATEGORY_TIRE),
    [products]
  )
  const autoProducts = useMemo(
    () => products.filter((product) => product.category?.name !== CATEGORY_TIRE),
    [products]
  )

  const getTireDetailKey = (detail?: typeof tireProducts[number]['tireDetails']) =>
    detail
      ? `${detail.size}|${detail.loadIndex?.code ?? ''}|${detail.speedIndex?.code ?? ''}|${
          detail.isXL ? '1' : '0'
        }|${detail.isRunFlat ? '1' : '0'}`
      : ''

  const getTireDetailLabel = (detail?: typeof tireProducts[number]['tireDetails']) =>
    detail
      ? `${detail.size || ''} ${detail.loadIndex?.code || ''}${
          detail.speedIndex?.code || ''
        } ${detail.isXL ? 'XL' : ''} ${detail.isRunFlat ? 'RunFlat' : ''}`.trim()
      : '—'

  const tireDetailOptions = useMemo(() => {
    const map = new Map<string, string>()
    tireProducts.forEach((product) => {
      const key = getTireDetailKey(product.tireDetails ?? undefined)
      if (key && !map.has(key)) {
        map.set(key, getTireDetailLabel(product.tireDetails ?? undefined))
      }
    })
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }))
  }, [tireProducts])

  const getTireBrandsForDetail = (detailKey: string) => {
    const map = new Map<string, string>()
    tireProducts.forEach((product) => {
      const key = getTireDetailKey(product.tireDetails ?? undefined)
      if (key !== detailKey) return
      const brand = product.tireDetails?.brand
      if (brand) {
        map.set(brand.id, brand.name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }

  const getTireModelsForDetailBrand = (detailKey: string, brandId: string) => {
    const map = new Map<string, string>()
    tireProducts.forEach((product) => {
      const key = getTireDetailKey(product.tireDetails ?? undefined)
      if (key !== detailKey) return
      if (product.tireDetails?.brand?.id !== brandId) return
      const model = product.tireDetails?.model
      if (model) {
        map.set(model.id, model.name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }

  const autoSubcategoryOptions = useMemo(() => {
    const map = new Map<string, string>()
    autoProducts.forEach((product) => {
      const sub = product.autoDetails?.subcategory
      if (sub) {
        map.set(sub.id, sub.name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [autoProducts])

  const getAutoBrandsForSubcategory = (subcategoryId: string) => {
    const map = new Map<string, string>()
    autoProducts.forEach((product) => {
      if (product.autoDetails?.subcategory?.id !== subcategoryId) return
      const brand = product.autoDetails?.brand
      if (brand) {
        map.set(brand, brand)
      }
    })
    return Array.from(map.entries()).map(([name]) => ({ name }))
  }

  const getAutoModelsForSubcategoryBrand = (subcategoryId: string, brand: string) => {
    const map = new Map<string, string>()
    autoProducts.forEach((product) => {
      if (product.autoDetails?.subcategory?.id !== subcategoryId) return
      if (product.autoDetails?.brand !== brand) return
      const model = product.autoDetails?.model
      if (model) {
        map.set(model, model)
      }
    })
    return Array.from(map.entries()).map(([name]) => ({ name }))
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

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        rowId: `row-${prev.length + 1}`,
        kind: 'TIRE',
        tireDetailKey: '',
        tireBrandId: '',
        tireModelId: '',
        autoSubcategoryId: '',
        autoBrand: '',
        autoModel: '',
        quantity: '1',
        price: ''
      }
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
    if (!supplierId) {
      setFormError('Оберіть постачальника')
      return
    }
    const preparedItems = items
      .map((item) => {
        const productId =
          item.kind === 'TIRE'
            ? tireProducts.find(
                (product) =>
                  getTireDetailKey(product.tireDetails ?? undefined) ===
                    item.tireDetailKey &&
                  product.tireDetails?.brand?.id === item.tireBrandId &&
                  product.tireDetails?.model?.id === item.tireModelId
              )?.id
            : autoProducts.find(
                (product) =>
                  product.autoDetails?.subcategory?.id === item.autoSubcategoryId &&
                  product.autoDetails?.brand === item.autoBrand &&
                  product.autoDetails?.model === item.autoModel
              )?.id

        return {
          productId,
          quantity: Number(item.quantity),
          priceCents: parseMoneyToCents(item.price)
        }
      })
      .filter(
        (item): item is { productId: string; quantity: number; priceCents: number } =>
          Boolean(item.productId) && item.quantity > 0
      )

    if (preparedItems.length === 0) {
      setFormError('Додайте хоча б один товар')
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
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? (err as { status?: number }).status
          : undefined
      if (status === 409) {
        setStockWarning('Недостатньо залишку для продажу')
      }
      return
    }

    setSupplierId('')
    setOrderDate('')
    setEditingId(null)
    setItems([
      {
        rowId: 'row-1',
        kind: 'TIRE',
        tireDetailKey: '',
        tireBrandId: '',
        tireModelId: '',
        autoSubcategoryId: '',
        autoBrand: '',
        autoModel: '',
        quantity: '1',
        price: ''
      }
    ])
  }

  useEffect(() => {
    if (!editingOrder) return
    setSupplierId(editingOrder.counterparty?.id ?? '')
    setOrderDate(editingOrder.orderDate?.slice(0, 10) ?? '')
    const mappedItems =
      editingOrder.items?.map((item) => {
        const isTire = item.product.category?.name === CATEGORY_TIRE
        if (isTire) {
          return {
            rowId: item.id,
            kind: 'TIRE' as const,
            tireDetailKey: getTireDetailKey(item.product.tireDetails ?? undefined),
            tireBrandId: item.product.tireDetails?.brand?.id ?? '',
            tireModelId: item.product.tireDetails?.model?.id ?? '',
            autoSubcategoryId: '',
            autoBrand: '',
            autoModel: '',
            quantity: String(item.quantity),
            price: (item.priceCents / 100).toFixed(2)
          }
        }
        return {
          rowId: item.id,
          kind: 'AUTO' as const,
          tireDetailKey: '',
          tireBrandId: '',
          tireModelId: '',
          autoSubcategoryId: item.product.autoDetails?.subcategory?.id ?? '',
          autoBrand: item.product.autoDetails?.brand ?? '',
          autoModel: item.product.autoDetails?.model ?? '',
          quantity: String(item.quantity),
          price: (item.priceCents / 100).toFixed(2)
        }
      }) ?? []

    setItems(
      mappedItems.length > 0
        ? mappedItems
        : [
            {
              rowId: 'row-1',
              kind: 'TIRE',
              tireDetailKey: '',
              tireBrandId: '',
              tireModelId: '',
              autoSubcategoryId: '',
              autoBrand: '',
              autoModel: '',
              quantity: '1',
              price: ''
            }
          ]
    )
  }, [editingOrder])

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
              {activeSuppliers.map((supplier) => (
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
                <TableCell>Тип</TableCell>
                <TableCell>Деталі</TableCell>
                <TableCell>Бренд</TableCell>
                <TableCell>Модель</TableCell>
                <TableCell>К-сть</TableCell>
                <TableCell>Ціна (грн)</TableCell>
                <TableCell>Сума</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const qty = Number(item.quantity)
                const rowTotal = qty > 0 ? parseMoneyToCents(item.price) * qty : 0
                const tireBrands = item.tireDetailKey
                  ? getTireBrandsForDetail(item.tireDetailKey)
                  : []
                const tireModels =
                  item.tireDetailKey && item.tireBrandId
                    ? getTireModelsForDetailBrand(item.tireDetailKey, item.tireBrandId)
                    : []
                const autoBrands = item.autoSubcategoryId
                  ? getAutoBrandsForSubcategory(item.autoSubcategoryId)
                  : []
                const autoModels =
                  item.autoSubcategoryId && item.autoBrand
                    ? getAutoModelsForSubcategoryBrand(item.autoSubcategoryId, item.autoBrand)
                    : []
                return (
                  <TableRow key={item.rowId}>
                    <TableCell>
                      <TextField
                        select
                        value={item.kind}
                        onChange={(event) =>
                          updateRow(item.rowId, {
                            kind: event.target.value as 'TIRE' | 'AUTO',
                            tireDetailKey: '',
                            tireBrandId: '',
                            tireModelId: '',
                            autoSubcategoryId: '',
                            autoBrand: '',
                            autoModel: ''
                          })
                        }
                      >
                        <MenuItem value="TIRE">Шини</MenuItem>
                        <MenuItem value="AUTO">Автотовари</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>
                      {item.kind === 'TIRE' ? (
                        <TextField
                          select
                          value={item.tireDetailKey}
                          onChange={(event) =>
                            updateRow(item.rowId, {
                              tireDetailKey: event.target.value,
                              tireBrandId: '',
                              tireModelId: ''
                            })
                          }
                        >
                          {tireDetailOptions.map((detail) => (
                            <MenuItem key={detail.key} value={detail.key}>
                              {detail.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          select
                          value={item.autoSubcategoryId}
                          onChange={(event) =>
                            updateRow(item.rowId, {
                              autoSubcategoryId: event.target.value,
                              autoBrand: '',
                              autoModel: ''
                            })
                          }
                        >
                          {autoSubcategoryOptions.map((subcategory) => (
                            <MenuItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.kind === 'TIRE' ? (
                        <TextField
                          select
                          value={item.tireBrandId}
                          onChange={(event) =>
                            updateRow(item.rowId, {
                              tireBrandId: event.target.value,
                              tireModelId: ''
                            })
                          }
                          disabled={!item.tireDetailKey}
                        >
                          {tireBrands.map((brand) => (
                            <MenuItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          select
                          value={item.autoBrand}
                          onChange={(event) =>
                            updateRow(item.rowId, {
                              autoBrand: event.target.value,
                              autoModel: ''
                            })
                          }
                          disabled={!item.autoSubcategoryId}
                        >
                          {autoBrands.map((brand) => (
                            <MenuItem key={brand.name} value={brand.name}>
                              {brand.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.kind === 'TIRE' ? (
                        <TextField
                          select
                          value={item.tireModelId}
                          onChange={(event) =>
                            updateRow(item.rowId, { tireModelId: event.target.value })
                          }
                          disabled={!item.tireBrandId}
                        >
                          {tireModels.map((model) => (
                            <MenuItem key={model.id} value={model.id}>
                              {model.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          select
                          value={item.autoModel}
                          onChange={(event) =>
                            updateRow(item.rowId, { autoModel: event.target.value })
                          }
                          disabled={!item.autoBrand}
                        >
                          {autoModels.map((model) => (
                            <MenuItem key={model.name} value={model.name}>
                              {model.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
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
          {createError && <Alert severity="error">Не вдалося створити закупку</Alert>}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={async () => {
                if (editingId) {
                  setFormError(null)
                  if (!supplierId) {
                    setFormError('Оберіть постачальника')
                    return
                  }
                  const preparedItems = items
                    .map((item) => {
                      const productId =
                        item.kind === 'TIRE'
                          ? tireProducts.find(
                              (product) =>
                                getTireDetailKey(product.tireDetails ?? undefined) ===
                                  item.tireDetailKey &&
                                product.tireDetails?.brand?.id === item.tireBrandId &&
                                product.tireDetails?.model?.id === item.tireModelId
                            )?.id
                          : autoProducts.find(
                              (product) =>
                                product.autoDetails?.subcategory?.id ===
                                  item.autoSubcategoryId &&
                                product.autoDetails?.brand === item.autoBrand &&
                                product.autoDetails?.model === item.autoModel
                            )?.id

                      return {
                        productId,
                        quantity: Number(item.quantity),
                        priceCents: parseMoneyToCents(item.price)
                      }
                    })
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
                      type: 'PURCHASE',
                      counterpartyId: supplierId,
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
                  setSupplierId('')
                  setOrderDate('')
                  setItems([
                    {
                      rowId: 'row-1',
                      kind: 'TIRE',
                      tireDetailKey: '',
                      tireBrandId: '',
                      tireModelId: '',
                      autoSubcategoryId: '',
                      autoBrand: '',
                      autoModel: '',
                      quantity: '1',
                      price: ''
                    }
                  ])
                }}
              >
                Скасувати
              </Button>
            )}
          </Stack>
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
                    <Button
                      size="small"
                      onClick={() => navigate(`/purchases/${order.id}`)}
                    >
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
