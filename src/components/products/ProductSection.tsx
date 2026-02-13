import { useMemo, useState } from 'react'
import { useFormik } from 'formik'
import styled from 'styled-components'
import {
  Alert,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
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
import { SectionCard } from '../shared/SectionCard'
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetTireBrandsQuery,
  useGetTireLoadIndicesQuery,
  useGetTireSpeedIndicesQuery,
  useGetUnitsQuery,
  useGetAutoSubcategoriesQuery,
  useUpdateProductMutation
} from '../../store/api'
import {
  CATEGORY_TIRE,
  EMPTY_HELPER,
  ERROR_AUTO_SUBCATEGORY,
  ERROR_ENTER_BRAND,
  ERROR_ENTER_MODEL,
  ERROR_ENTER_SIZE,
  ERROR_LOAD_INDEX,
  ERROR_SELECT_BRAND,
  ERROR_SELECT_CATEGORY,
  ERROR_SELECT_MODEL,
  ERROR_SPEED_INDEX
} from './constants'
import type { ProductErrors } from './types'
import type { Product } from '../../types/product'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';


const Form = styled.form`
  display: grid;
  gap: 12px;
`

const TwoColumn = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`

export const ProductSection = () => {
  const { data: categories } = useGetCategoriesQuery()
  const { data, isLoading, isError } = useGetProductsQuery()
  const { data: tireBrands = [] } = useGetTireBrandsQuery()
  const { data: speedIndices = [] } = useGetTireSpeedIndicesQuery()
  const { data: loadIndices = [] } = useGetTireLoadIndicesQuery()
  const { data: units = [] } = useGetUnitsQuery()
  const { data: autoSubcategories = [] } = useGetAutoSubcategoriesQuery()
  const [createProduct, { isLoading: isSaving, error: saveError }] =
    useCreateProductMutation()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const formik = useFormik({
    initialValues: {
      categoryId: categories?.[0]?.id ?? '',
      autoBrand: '',
      autoModel: '',
      unitId: '',
      tireSize: '',
      tireSpeedIndexId: '',
      tireLoadIndexId: '',
      tireBrandId: '',
      tireModelId: '',
      tireIsXL: false,
      tireIsRunFlat: false,
      autoSubcategoryId: ''
    },
    enableReinitialize: true,
    validate: (values) => {
      const selected = categories?.find((category) => category.id === values.categoryId)
      const isTire = selected?.name === CATEGORY_TIRE
      const isAuto = Boolean(selected && selected.name !== CATEGORY_TIRE)

      const errors: ProductErrors = {}
      if (!values.categoryId) {
        errors.categoryId = ERROR_SELECT_CATEGORY
      }
      if (isTire) {
        if (!values.tireBrandId) {
          errors.tireBrandId = ERROR_SELECT_BRAND
        }
        if (!values.tireModelId) {
          errors.tireModelId = ERROR_SELECT_MODEL
        }
        if (!values.tireSize.trim()) {
          errors.tireSize = ERROR_ENTER_SIZE
        }
        if (!values.tireSpeedIndexId) {
          errors.tireSpeedIndexId = ERROR_SPEED_INDEX
        }
        if (!values.tireLoadIndexId) {
          errors.tireLoadIndexId = ERROR_LOAD_INDEX
        }
      }
      if (isAuto) {
        if (!values.autoBrand.trim()) {
          errors.autoBrand = ERROR_ENTER_BRAND
        }
        if (!values.autoModel.trim()) {
          errors.autoModel = ERROR_ENTER_MODEL
        }
        if (!values.autoSubcategoryId) {
          errors.autoSubcategoryId = ERROR_AUTO_SUBCATEGORY
        }
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      const payload = {
        categoryId: values.categoryId,
        unitId: values.unitId || undefined,
        tireSize: values.tireSize.trim() || undefined,
        tireSpeedIndexId: values.tireSpeedIndexId || undefined,
        tireLoadIndexId: values.tireLoadIndexId || undefined,
        tireBrandId: values.tireBrandId || undefined,
        tireModelId: values.tireModelId || undefined,
        tireIsXL: values.tireIsXL,
        tireIsRunFlat: values.tireIsRunFlat,
        autoBrand: values.autoBrand.trim() || undefined,
        autoModel: values.autoModel.trim() || undefined,
        autoSubcategoryId: values.autoSubcategoryId || undefined
      }

      if (editingProductId) {
        await updateProduct({ id: editingProductId, ...payload }).unwrap()
      } else {
        await createProduct(payload).unwrap()
      }
      helpers.resetForm()
      setEditingProductId(null)
    }
  })

  const selectedCategory = categories?.find((category) => category.id === formik.values.categoryId)
  const isTire = selectedCategory?.name === CATEGORY_TIRE
  const isAuto = Boolean(selectedCategory && selectedCategory.name !== CATEGORY_TIRE)
  const selectedBrand = useMemo(
    () => tireBrands.find((brand) => brand.id === formik.values.tireBrandId),
    [formik.values.tireBrandId, tireBrands]
  )
  const modelsForBrand = selectedBrand?.models ?? []

  const startEdit = (product: Product) => {
    setEditingProductId(product.id)
    formik.setValues({
      categoryId: product.category?.id ?? '',
      autoBrand: product.autoDetails?.brand ?? '',
      autoModel: product.autoDetails?.model ?? '',
      unitId: product.unit?.id ?? '',
      tireSize: product.tireDetails?.size ?? '',
      tireSpeedIndexId: product.tireDetails?.speedIndex?.id ?? '',
      tireLoadIndexId: product.tireDetails?.loadIndex?.id ?? '',
      tireBrandId: product.tireDetails?.brand?.id ?? '',
      tireModelId: product.tireDetails?.model?.id ?? '',
      tireIsXL: Boolean(product.tireDetails?.isXL),
      tireIsRunFlat: Boolean(product.tireDetails?.isRunFlat),
      autoSubcategoryId: product.autoDetails?.subcategory?.id ?? ''
    })
  }

  const handleDelete = async (productId: string) => {
    if (window.confirm('Видалити товар?')) {
      setActionError(null)
      try {
        await deleteProduct(productId).unwrap()
        if (editingProductId === productId) {
          formik.resetForm()
          setEditingProductId(null)
        }
      } catch (err: any) {
        if (err?.status === 409) {
          setActionError('Товар використовується у продажах/закупках. Видалення заборонено.')
        } else {
          setActionError('Не вдалося видалити товар.')
        }
      }
    }
  }

  return (
    <SectionCard>
      <Typography variant="h6">Товари</Typography>

      <Form onSubmit={formik.handleSubmit}>
                <TextField
          select
          label="Категорія"
          name="categoryId"
          value={formik.values.categoryId}
          onChange={(event) => {
            formik.handleChange(event)
            formik.setFieldValue('autoBrand', '')
            formik.setFieldValue('autoModel', '')
            formik.setFieldValue('tireBrandId', '')
            formik.setFieldValue('tireModelId', '')
            formik.setFieldValue('tireSpeedIndexId', '')
            formik.setFieldValue('tireLoadIndexId', '')
            formik.setFieldValue('tireSize', '')
            formik.setFieldValue('tireIsXL', false)
            formik.setFieldValue('tireIsRunFlat', false)
            formik.setFieldValue('autoSubcategoryId', '')
          }}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.categoryId && formik.errors.categoryId)}
          helperText={formik.touched.categoryId ? formik.errors.categoryId : EMPTY_HELPER}
          fullWidth
        >
          {(categories ?? []).map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        {isAuto && (
          <TwoColumn>
            <TextField
              label="Бренд"
              name="autoBrand"
              value={formik.values.autoBrand}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.autoBrand && formik.errors.autoBrand)}
              helperText={
                formik.touched.autoBrand ? formik.errors.autoBrand : EMPTY_HELPER
              }
            />
            <TextField
              label="Модель"
              name="autoModel"
              value={formik.values.autoModel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.autoModel && formik.errors.autoModel)}
              helperText={
                formik.touched.autoModel ? formik.errors.autoModel : EMPTY_HELPER
              }
            />
          </TwoColumn>
        )}

        {isTire && (
          <>
            <TwoColumn>
              <TextField
                select
                label="Бренд"
                name="tireBrandId"
                value={formik.values.tireBrandId}
                onChange={(event) => {
                  formik.handleChange(event)
                  formik.setFieldValue('tireModelId', '')
                }}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.tireBrandId && formik.errors.tireBrandId)}
              helperText={
                  formik.touched.tireBrandId ? formik.errors.tireBrandId : EMPTY_HELPER
                }
                fullWidth
              >
                {tireBrands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Модель"
                name="tireModelId"
                value={formik.values.tireModelId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.tireModelId && formik.errors.tireModelId)}
                helperText={
                  formik.touched.tireModelId ? formik.errors.tireModelId : EMPTY_HELPER
                }
                disabled={!formik.values.tireBrandId}
                fullWidth
              >
                {modelsForBrand.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </TextField>
            </TwoColumn>

            <TwoColumn>
              <TextField
                label="Розмір"
                name="tireSize"
                value={formik.values.tireSize}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.tireSize && formik.errors.tireSize)}
                helperText={formik.touched.tireSize ? formik.errors.tireSize : EMPTY_HELPER}
                placeholder="205/55 R16"
              />
              <TextField
                select
                label="Індекс швидкості"
                name="tireSpeedIndexId"
                value={formik.values.tireSpeedIndexId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(
                  formik.touched.tireSpeedIndexId && formik.errors.tireSpeedIndexId
                )}
                helperText={
                  formik.touched.tireSpeedIndexId
                    ? formik.errors.tireSpeedIndexId
                    : EMPTY_HELPER
                }
              >
                {speedIndices.map((index) => (
                  <MenuItem key={index.id} value={index.id}>
                    {index.code} — до {index.maxKph} км/г
                  </MenuItem>
                ))}
              </TextField>
            </TwoColumn>
          </>
        )}

        {isTire && (
          <TwoColumn>
            <TextField
              select
              label="Індекс навантаження"
              name="tireLoadIndexId"
              value={formik.values.tireLoadIndexId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.tireLoadIndexId && formik.errors.tireLoadIndexId
              )}
              helperText={
                formik.touched.tireLoadIndexId ? formik.errors.tireLoadIndexId : EMPTY_HELPER
              }
            >
              {loadIndices.map((index) => (
                <MenuItem key={index.id} value={index.id}>
                  {index.code} — до {index.maxKg} кг
                </MenuItem>
              ))}
            </TextField>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    name="tireIsXL"
                    checked={formik.values.tireIsXL}
                    onChange={formik.handleChange}
                  />
                }
                label="XL"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="tireIsRunFlat"
                    checked={formik.values.tireIsRunFlat}
                    onChange={formik.handleChange}
                  />
                }
                label="RunFlat"
              />
            </div>
          </TwoColumn>
        )}

        {isAuto && (
          <TextField
            select
            label="Підкатегорія"
            name="autoSubcategoryId"
            value={formik.values.autoSubcategoryId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.autoSubcategoryId && formik.errors.autoSubcategoryId
            )}
            helperText={
              formik.touched.autoSubcategoryId
                ? formik.errors.autoSubcategoryId
                : EMPTY_HELPER
            }
            fullWidth
          >
            {autoSubcategories.map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          select
          label="Одиниця"
          name="unitId"
          value={formik.values.unitId}
          onChange={formik.handleChange}
          fullWidth
        >
          <MenuItem value="">—</MenuItem>
          {units.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {unit.name}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={!formik.isValid || isSaving || isUpdating}
          >
            {editingProductId
              ? isUpdating
                ? 'Оновлюю...'
                : 'Зберегти зміни'
              : isSaving
                ? 'Зберігаю...'
                : 'Додати товар'}
          </Button>
          {editingProductId && (
            <Button
              variant="outlined"
              onClick={() => {
                formik.resetForm()
                setEditingProductId(null)
              }}
            >
              Скасувати
            </Button>
          )}
        </Stack>
      </Form>

      {actionError && <Alert severity="error">{actionError}</Alert>}
      {isLoading 
      ? 
      <CircularProgress size={28} /> 
      :       
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell>Деталі</TableCell>
            <TableCell>Бренд</TableCell>
            <TableCell>Модель</TableCell>
            <TableCell>Категорія</TableCell>
            <TableCell>Змінити</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(data ?? []).map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.category?.name === CATEGORY_TIRE
                  ? `${product.tireDetails?.size || ''} ${
                      product.tireDetails?.loadIndex?.code || ''
                    }${product.tireDetails?.speedIndex?.code || ''} ${
                      product.tireDetails?.isXL ? 'XL' : ''
                    } ${product.tireDetails?.isRunFlat ? 'RunFlat' : ''}`.trim() || '—'
                  : product.autoDetails?.subcategory?.name || '—'}
              </TableCell>
              <TableCell>
                {product.category?.name === CATEGORY_TIRE
                  ? product.tireDetails?.brand?.name || '—'
                  : product.autoDetails?.brand || '—'}
              </TableCell>
              <TableCell>
                {product.category?.name === CATEGORY_TIRE
                  ? product.tireDetails?.model?.name || '—'
                  : product.autoDetails?.model || '—'}
              </TableCell>
              <TableCell>{product.category?.name}</TableCell>
              <TableCell>
                <IconButton
                  aria-label="edit"
                  size="small"
                  onClick={() => startEdit(product)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="delete"
                  size="small"
                  color="error"
                  onClick={() => handleDelete(product.id)}
                  disabled={isDeleting}
                >
                  <DeleteForeverOutlinedIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>}
      {isError && <Alert severity="error">Не вдалося завантажити товари</Alert>}
      {saveError && <Alert severity="error">Не вдалося створити товар</Alert>}
    </SectionCard>
  )
}
