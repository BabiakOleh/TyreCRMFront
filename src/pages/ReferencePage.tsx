import { useFormik } from 'formik'
import styled from 'styled-components'
import {
  Alert,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { Content, Grid } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
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

  const categoryFormik = useFormik({
    initialValues: { name: '' },
    validate: (values) => {
      const errors: { name?: string } = {}
      if (!values.name.trim()) {
        errors.name = 'Вкажи назву'
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      await createCategory({ name: values.name.trim() }).unwrap()
      helpers.resetForm()
    }
  })

  const unitFormik = useFormik({
    initialValues: { name: '' },
    validate: (values) => {
      const errors: { name?: string } = {}
      if (!values.name.trim()) {
        errors.name = 'Вкажи назву'
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      await createUnit({ name: values.name.trim() }).unwrap()
      helpers.resetForm()
    }
  })

  const autoSubcategoryFormik = useFormik({
    initialValues: { name: '' },
    validate: (values) => {
      const errors: { name?: string } = {}
      if (!values.name.trim()) {
        errors.name = 'Вкажи назву'
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      await createAutoSubcategory({ name: values.name.trim() }).unwrap()
      helpers.resetForm()
    }
  })

  const tireBrandFormik = useFormik({
    initialValues: { name: '' },
    validate: (values) => {
      const errors: { name?: string } = {}
      if (!values.name.trim()) {
        errors.name = 'Вкажи назву'
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      await createTireBrand({ name: values.name.trim() }).unwrap()
      helpers.resetForm()
    }
  })

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
        <SectionCard>
          <Typography variant="subtitle1">Категорії</Typography>
          <FormRow onSubmit={categoryFormik.handleSubmit}>
            <TextField
              label="Назва"
              name="name"
              value={categoryFormik.values.name}
              onChange={categoryFormik.handleChange}
              onBlur={categoryFormik.handleBlur}
              error={Boolean(categoryFormik.touched.name && categoryFormik.errors.name)}
              helperText={categoryFormik.touched.name && categoryFormik.errors.name}
            />
            <Button type="submit" variant="contained" disabled={categoryState.isLoading}>
              Додати
            </Button>
          </FormRow>
          {categoryState.error && (
            <Alert severity="error">Не вдалося додати категорію</Alert>
          )}
          <Stack spacing={0.5}>
            {categories.map((category) => (
              <Typography key={category.id}>{category.name}</Typography>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard>
          <Typography variant="subtitle1">Одиниці виміру</Typography>
          <FormRow onSubmit={unitFormik.handleSubmit}>
            <TextField
              label="Назва"
              name="name"
              value={unitFormik.values.name}
              onChange={unitFormik.handleChange}
              onBlur={unitFormik.handleBlur}
              error={Boolean(unitFormik.touched.name && unitFormik.errors.name)}
              helperText={unitFormik.touched.name && unitFormik.errors.name}
            />
            <Button type="submit" variant="contained" disabled={unitState.isLoading}>
              Додати
            </Button>
          </FormRow>
          {unitState.error && <Alert severity="error">Не вдалося додати одиницю</Alert>}
          <Stack spacing={0.5}>
            {units.map((unit) => (
              <Typography key={unit.id}>{unit.name}</Typography>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard>
          <Typography variant="subtitle1">Підкатегорії автотоварів</Typography>
          <FormRow onSubmit={autoSubcategoryFormik.handleSubmit}>
            <TextField
              label="Назва"
              name="name"
              value={autoSubcategoryFormik.values.name}
              onChange={autoSubcategoryFormik.handleChange}
              onBlur={autoSubcategoryFormik.handleBlur}
              error={Boolean(
                autoSubcategoryFormik.touched.name &&
                  autoSubcategoryFormik.errors.name
              )}
              helperText={
                autoSubcategoryFormik.touched.name &&
                autoSubcategoryFormik.errors.name
              }
            />
            <Button
              type="submit"
              variant="contained"
              disabled={autoSubcategoryState.isLoading}
            >
              Додати
            </Button>
          </FormRow>
          {autoSubcategoryState.error && (
            <Alert severity="error">Не вдалося додати підкатегорію</Alert>
          )}
          <Stack spacing={0.5}>
            {autoSubcategories.map((subcategory) => (
              <Typography key={subcategory.id}>{subcategory.name}</Typography>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard>
          <Typography variant="subtitle1">Бренди шин</Typography>
          <FormRow onSubmit={tireBrandFormik.handleSubmit}>
            <TextField
              label="Назва"
              name="name"
              value={tireBrandFormik.values.name}
              onChange={tireBrandFormik.handleChange}
              onBlur={tireBrandFormik.handleBlur}
              error={Boolean(tireBrandFormik.touched.name && tireBrandFormik.errors.name)}
              helperText={tireBrandFormik.touched.name && tireBrandFormik.errors.name}
            />
            <Button type="submit" variant="contained" disabled={tireBrandState.isLoading}>
              Додати
            </Button>
          </FormRow>
          {tireBrandState.error && (
            <Alert severity="error">Не вдалося додати бренд</Alert>
          )}
          <Stack spacing={0.5}>
            {tireBrands.map((brand) => (
              <Typography key={brand.id}>{brand.name}</Typography>
            ))}
          </Stack>
        </SectionCard>

        <SectionCard>
          <Typography variant="subtitle1">Моделі шин</Typography>
          <FormRow onSubmit={tireModelFormik.handleSubmit}>
            <TextField
              select
              label="Бренд"
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
              label="Модель"
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
            <Alert severity="error">Не вдалося додати модель</Alert>
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
