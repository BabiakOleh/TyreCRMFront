import { useFormik } from 'formik'
import styled from 'styled-components'
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Content, Grid } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import { DictionarySection } from '../components/reference/DictionarySection'
import { FORM_LABELS } from '../constants/labels'
import { ERROR_MESSAGES } from '../constants/messages'
import {
  useCreateAutoSubcategoryMutation,
  useCreateCategoryMutation,
  useCreateTireBrandMutation,
  useCreateTireModelMutation,
  useCreateUnitMutation,
  useGetAutoSubcategoriesQuery,
  useGetCategoriesQuery,
  useGetTireBrandsQuery,
  useGetUnitsQuery
} from '../store/api'

const FormRow = styled.form`
  display: grid;
  gap: 12px;
`

export const ReferencePage = () => {
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: units = [] } = useGetUnitsQuery()
  const { data: autoSubcategories = [] } = useGetAutoSubcategoriesQuery()
  const { data: tireBrands = [] } = useGetTireBrandsQuery()

  const [createCategory, categoryState] = useCreateCategoryMutation()
  const [createUnit, unitState] = useCreateUnitMutation()
  const [createAutoSubcategory, autoSubcategoryState] =
    useCreateAutoSubcategoryMutation()
  const [createTireBrand, tireBrandState] = useCreateTireBrandMutation()
  const [createTireModel, tireModelState] = useCreateTireModelMutation()


  const tireModelFormik = useFormik({
    initialValues: { brandId: '', name: '' },
    validate: (values) => {
      const errors: { brandId?: string; name?: string } = {}
      if (!values.brandId) {
        errors.brandId = 'Оберіть бренд'
      }
      if (!values.name.trim()) {
        errors.name = 'Вкажи модель'
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      await createTireModel({
        brandId: values.brandId,
        name: values.name.trim()
      }).unwrap()
      helpers.resetForm()
    }
  })

  return (
    <Content>
      <Typography variant="h6">Довідники</Typography>
      <Grid>
        <DictionarySection
          title="Категорії"
          items={categories}
          onCreate={(data) => createCategory(data).unwrap()}
          isLoading={categoryState.isLoading}
          error={categoryState.error}
        />

        <DictionarySection
          title="Одиниці виміру"
          items={units}
          onCreate={(data) => createUnit(data).unwrap()}
          isLoading={unitState.isLoading}
          error={unitState.error}
        />

        <DictionarySection
          title="Підкатегорії автотоварів"
          items={autoSubcategories}
          onCreate={(data) => createAutoSubcategory(data).unwrap()}
          isLoading={autoSubcategoryState.isLoading}
          error={autoSubcategoryState.error}
        />

        <DictionarySection
          title="Бренди шин"
          items={tireBrands}
          onCreate={(data) => createTireBrand(data).unwrap()}
          isLoading={tireBrandState.isLoading}
          error={tireBrandState.error}
        />

        <SectionCard>
          <Typography variant="subtitle1">Моделі шин</Typography>
          <FormRow onSubmit={tireModelFormik.handleSubmit}>
            <TextField
              select
              label={FORM_LABELS.brand}
              name="brandId"
              value={tireModelFormik.values.brandId}
              onChange={tireModelFormik.handleChange}
              onBlur={tireModelFormik.handleBlur}
              error={Boolean(tireModelFormik.touched.brandId && tireModelFormik.errors.brandId)}
              helperText={tireModelFormik.touched.brandId && tireModelFormik.errors.brandId}
            >
              {tireBrands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={FORM_LABELS.model}
              name="name"
              value={tireModelFormik.values.name}
              onChange={tireModelFormik.handleChange}
              onBlur={tireModelFormik.handleBlur}
              error={Boolean(tireModelFormik.touched.name && tireModelFormik.errors.name)}
              helperText={tireModelFormik.touched.name && tireModelFormik.errors.name}
            />
            <Button type="submit" variant="contained" disabled={tireModelState.isLoading}>
              Додати
            </Button>
          </FormRow>
          {tireModelState.error && (
            <Alert severity="error">{ERROR_MESSAGES.addTireModel}</Alert>
          )}
          <Stack spacing={0.5}>
            {tireBrands.map((brand) => (
              <Typography key={brand.id}>
                {brand.name}: {brand.models?.map((model) => model.name).join(', ') || '—'}
              </Typography>
            ))}
          </Stack>
        </SectionCard>
      </Grid>
    </Content>
  )
}
