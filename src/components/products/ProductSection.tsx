import { useMemo } from 'react'
import { useFormik } from 'formik'
import styled from 'styled-components'
import {
  Alert,
  Button,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  MenuItem,
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
  useCreateTireBrandMutation,
  useCreateTireModelMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetTireBrandsQuery,
  useGetTireLoadIndicesQuery,
  useGetTireSpeedIndicesQuery
} from '../../store/api'
import {
  CATEGORY_AUTO,
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
  ERROR_SPEED_INDEX,
  LABEL_ADD,
  LABEL_NEW_BRAND,
  LABEL_NEW_MODEL
} from './constants'

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
  const { data: tireBrands = [], refetch: refetchTireBrands } = useGetTireBrandsQuery()
  const { data: speedIndices = [] } = useGetTireSpeedIndicesQuery()
  const { data: loadIndices = [] } = useGetTireLoadIndicesQuery()
  const [createProduct, { isLoading: isSaving, error: saveError }] =
    useCreateProductMutation()
  const [createTireBrand] = useCreateTireBrandMutation()
  const [createTireModel] = useCreateTireModelMutation()

  const formik = useFormik({
    initialValues: {
      categoryId: categories?.[0]?.id ?? '',
      brand: '',
      model: '',
      unit: '',
      tireSize: '',
      tireSpeedIndexId: '',
      tireLoadIndexId: '',
      tireBrandId: '',
      tireModelId: '',
      newBrandName: '',
      newModelName: '',
      tireIsXL: false,
      tireIsRunFlat: false,
      autoSubcategory: ''
    },
    enableReinitialize: true,
    validate: (values) => {
      const selected = categories?.find((category) => category.id === values.categoryId)
      const isTire = selected?.name === CATEGORY_TIRE
      const isAuto = selected?.name === CATEGORY_AUTO

      const errors: {
        brand?: string
        model?: string
        categoryId?: string
        tireSize?: string
        tireSpeedIndexId?: string
        tireLoadIndexId?: string
        tireBrandId?: string
        tireModelId?: string
        newBrandName?: string
        newModelName?: string
        autoSubcategory?: string
      } = {}
      if (!values.categoryId) {
        errors.categoryId = ERROR_SELECT_CATEGORY
      }
      if (isTire) {
        if (!values.tireBrandId) {
          errors.tireBrandId = ERROR_SELECT_BRAND
        }
        if (values.tireBrandId === 'NEW' && !values.newBrandName.trim()) {
          errors.newBrandName = ERROR_ENTER_BRAND
        }
        if (values.tireBrandId !== 'NEW') {
          if (!values.tireModelId) {
            errors.tireModelId = ERROR_SELECT_MODEL
          }
          if (values.tireModelId === 'NEW' && !values.newModelName.trim()) {
            errors.newModelName = ERROR_ENTER_MODEL
          }
        } else if (!values.newModelName.trim()) {
          errors.newModelName = ERROR_ENTER_MODEL
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
        if (!values.brand.trim()) {
          errors.brand = ERROR_ENTER_BRAND
        }
        if (!values.model.trim()) {
          errors.model = ERROR_ENTER_MODEL
        }
        if (!values.autoSubcategory.trim()) {
          errors.autoSubcategory = ERROR_AUTO_SUBCATEGORY
        }
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      let tireBrandId = values.tireBrandId
      let tireModelId = values.tireModelId
      let brandName = values.brand.trim()
      let modelName = values.model.trim()

      if (isTire) {
        if (tireBrandId === 'NEW') {
          const brand = await createTireBrand({ name: values.newBrandName.trim() }).unwrap()
          await refetchTireBrands()
          tireBrandId = brand.id
          brandName = brand.name
        } else {
          const existingBrand = tireBrands.find((brand) => brand.id === tireBrandId)
          brandName = existingBrand?.name ?? brandName
        }

        if (tireBrandId && (tireModelId === 'NEW' || !tireModelId)) {
          const model = await createTireModel({
            brandId: tireBrandId,
            name: values.newModelName.trim()
          }).unwrap()
          await refetchTireBrands()
          tireModelId = model.id
          modelName = model.name
        } else {
          const existingModel =
            tireBrands
              .find((brand) => brand.id === tireBrandId)
              ?.models?.find((model) => model.id === tireModelId) ?? null
          modelName = existingModel?.name ?? modelName
        }
      }

      await createProduct({
        brand: brandName || values.brand.trim(),
        model: modelName || values.model.trim(),
        categoryId: values.categoryId,
        unit: values.unit.trim() || undefined,
        tireSize: values.tireSize.trim() || undefined,
        tireSpeedIndexId: values.tireSpeedIndexId || undefined,
        tireLoadIndexId: values.tireLoadIndexId || undefined,
        tireBrandId: tireBrandId || undefined,
        tireModelId: tireModelId || undefined,
        tireIsXL: values.tireIsXL,
        tireIsRunFlat: values.tireIsRunFlat,
        autoSubcategory: values.autoSubcategory.trim() || undefined
      }).unwrap()
      helpers.resetForm()
    }
  })

  const selectedCategory = categories?.find((category) => category.id === formik.values.categoryId)
  const isTire = selectedCategory?.name === CATEGORY_TIRE
  const isAuto = selectedCategory?.name === CATEGORY_AUTO
  const selectedBrand = useMemo(
    () => tireBrands.find((brand) => brand.id === formik.values.tireBrandId),
    [formik.values.tireBrandId, tireBrands]
  )
  const modelsForBrand = selectedBrand?.models ?? []

  return (
    <SectionCard>
      <Typography variant="h6">Товари</Typography>

      <Form onSubmit={formik.handleSubmit}>
        {isAuto && (
          <TwoColumn>
            <TextField
              label="Бренд"
              name="brand"
              value={formik.values.brand}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.brand && formik.errors.brand)}
              helperText={formik.touched.brand ? formik.errors.brand : EMPTY_HELPER}
            />
            <TextField
              label="Модель"
              name="model"
              value={formik.values.model}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.model && formik.errors.model)}
              helperText={formik.touched.model ? formik.errors.model : EMPTY_HELPER}
            />
          </TwoColumn>
        )}

        <TextField
          select
          label="Категорія"
          name="categoryId"
          value={formik.values.categoryId}
          onChange={(event) => {
            formik.handleChange(event)
            formik.setFieldValue('brand', '')
            formik.setFieldValue('model', '')
            formik.setFieldValue('tireBrandId', '')
            formik.setFieldValue('tireModelId', '')
            formik.setFieldValue('newBrandName', '')
            formik.setFieldValue('newModelName', '')
            formik.setFieldValue('tireSpeedIndexId', '')
            formik.setFieldValue('tireLoadIndexId', '')
            formik.setFieldValue('tireSize', '')
            formik.setFieldValue('tireIsXL', false)
            formik.setFieldValue('tireIsRunFlat', false)
            formik.setFieldValue('autoSubcategory', '')
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
                  if (event.target.value !== 'NEW') {
                    formik.setFieldValue('newBrandName', '')
                  }
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
                <MenuItem value="NEW">{LABEL_ADD}</MenuItem>
              </TextField>

              {formik.values.tireBrandId === 'NEW' ? (
                <TextField
                  label={LABEL_NEW_BRAND}
                  name="newBrandName"
                  value={formik.values.newBrandName}
                  onChange={formik.handleChange}
                  error={Boolean(formik.errors.newBrandName)}
                  helperText={formik.errors.newBrandName ?? EMPTY_HELPER}
                />
              ) : (
                <TextField
                  select
                  label="Модель"
                  name="tireModelId"
                  value={formik.values.tireModelId}
                  onChange={(event) => {
                    formik.handleChange(event)
                    if (event.target.value !== 'NEW') {
                      formik.setFieldValue('newModelName', '')
                    }
                  }}
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
                  <MenuItem value="NEW">{LABEL_ADD}</MenuItem>
                </TextField>
              )}
            </TwoColumn>

            {formik.values.tireBrandId === 'NEW' && (
              <TextField
                label={LABEL_NEW_MODEL}
                name="newModelName"
                value={formik.values.newModelName}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.newModelName)}
                helperText={formik.errors.newModelName ?? EMPTY_HELPER}
                disabled={!formik.values.newBrandName.trim()}
              />
            )}

            {formik.values.tireBrandId !== 'NEW' && formik.values.tireModelId === 'NEW' && (
              <TextField
                label={LABEL_NEW_MODEL}
                name="newModelName"
                value={formik.values.newModelName}
                onChange={formik.handleChange}
                error={Boolean(formik.errors.newModelName)}
                helperText={formik.errors.newModelName ?? EMPTY_HELPER}
                disabled={!formik.values.tireBrandId}
              />
            )}

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
            label="Підкатегорія"
            name="autoSubcategory"
            value={formik.values.autoSubcategory}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.autoSubcategory && formik.errors.autoSubcategory)}
            helperText={
              formik.touched.autoSubcategory ? formik.errors.autoSubcategory : EMPTY_HELPER
            }
            placeholder="Масла, фільтра..."
            fullWidth
          />
        )}

        <TextField
          label="Одиниця"
          name="unit"
          value={formik.values.unit}
          onChange={formik.handleChange}
          placeholder="шт."
        />

        <Button type="submit" variant="contained" disabled={!formik.isValid || isSaving}>
          {isSaving ? 'Зберігаю...' : 'Додати товар'}
        </Button>
      </Form>

      {isLoading ? <CircularProgress size={28} /> :       <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Бренд</TableCell>
            <TableCell>Модель</TableCell>
            <TableCell>Категорія</TableCell>
            <TableCell>Деталі</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(data ?? []).map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.brand}</TableCell>
              <TableCell>{product.model}</TableCell>
              <TableCell>{product.category?.name}</TableCell>
              <TableCell>
                {product.category?.name === CATEGORY_TIRE
                  ? `${product.tireSize || ''} ${product.tireSpeedIndex?.code || ''} ${
                      product.tireLoadIndex?.code || ''
                    } ${
                      product.tireIsXL ? 'XL' : ''
                    } ${product.tireIsRunFlat ? 'RunFlat' : ''}`.trim() || '—'
                  : product.autoSubcategory || '—'}
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
