import { useCallback, useEffect, useMemo, useState } from 'react'
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
  useCreatePurchaseMutation,
  useGetCounterpartiesQuery,
  useGetOrderByIdQuery,
  useGetProductsQuery,
  useGetPurchasesQuery,
  useUpdateOrderMutation
} from '../store/api'
import {
  ERR_NO_ITEMS,
  handleOrderApiError,
  prepareOrderItems
} from '../utils/order'
import { formatMoney, parseMoneyToCents } from '../utils/money'
import { useOrderItems, type BaseItemRow } from '../hooks/useOrderItems'

const CATEGORY_TIRE = 'Шини'

type ItemRow = BaseItemRow & {
  kind: 'TIRE' | 'AUTO'
  tireDetailKey: string
  tireBrandId: string
  tireModelId: string
  autoSubcategoryId: string
  autoBrand: string
  autoModel: string
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
      kind: 'TIRE',
      tireDetailKey: '',
      tireBrandId: '',
      tireModelId: '',
      autoSubcategoryId: '',
      autoBrand: '',
      autoModel: '',
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

  const mapItemToPrepared = useCallback(
    (item: ItemRow) => {
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
    },
    [tireProducts, autoProducts]
  )

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
          <OrderFormHeader
            counterpartyLabel="Постачальник"
            counterpartyId={supplierId}
            onCounterpartyChange={setSupplierId}
            orderDate={orderDate}
            onOrderDateChange={setOrderDate}
            counterpartyOptions={activeSuppliers}
          />

          <TableContainer>
            <Table size="small" stickyHeader>
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
                    <TableRow
                      key={item.rowId}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
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
                          fullWidth
                        >
                          <MenuItem value="TIRE">Шини</MenuItem>
                          <MenuItem value="AUTO">Автотовари</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
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
                            fullWidth
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
                            fullWidth
                          >
                            {autoSubcategoryOptions.map((subcategory) => (
                              <MenuItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
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
                            fullWidth
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
                            fullWidth
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
                      <TableCell sx={{ py: 1.5 }}>
                        {item.kind === 'TIRE' ? (
                          <TextField
                            select
                            value={item.tireModelId}
                            onChange={(event) =>
                              updateRow(item.rowId, { tireModelId: event.target.value })
                            }
                            fullWidth
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
                            fullWidth
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
                      <OrderItemQuantityPrice
                        quantity={item.quantity}
                        price={item.price}
                        onQuantityChange={(value: string) =>
                          updateRow(item.rowId, { quantity: value })
                        }
                        onPriceChange={(value: string) =>
                          updateRow(item.rowId, { price: value })
                        }
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
            createErrorMessage="Не вдалося створити закупку"
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
          onEdit={setEditingId}
        />
      </SectionCard>
    </Content>
  )
}
