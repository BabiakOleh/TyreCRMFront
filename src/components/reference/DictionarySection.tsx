import { useFormik } from 'formik'
import styled from 'styled-components'
import { Alert, Button, Stack, TextField, Typography } from '@mui/material'
import { SectionCard } from '../shared/SectionCard'

const FormRow = styled.form`
  display: grid;
  gap: 12px;
`

type Props = {
  title: string
  items: Array<{ id: string; name: string }>
  onCreate: (data: { name: string }) => Promise<unknown>
  isLoading: boolean
  error: unknown
}

export const DictionarySection = ({
  title,
  items,
  onCreate,
  isLoading,
  error
}: Props) => {
  const formik = useFormik({
    initialValues: { name: '' },
    validate: (values) => {
      const errors: { name?: string } = {}
      if (!values.name.trim()) {
        errors.name = 'Вкажи назву'
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      await onCreate({ name: values.name.trim() })
      helpers.resetForm()
    }
  })

  const hasError = error != null

  return (
    <SectionCard>
      <Typography variant="subtitle1">{title}</Typography>
      <FormRow onSubmit={formik.handleSubmit}>
        <TextField
          label="Назва"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.name && formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
        />
        <Button type="submit" variant="contained" disabled={isLoading}>
          Додати
        </Button>
      </FormRow>
      {hasError && <Alert severity="error">Не вдалося додати запис</Alert>}
      <Stack spacing={0.5}>
        {items.map((item) => (
          <Typography key={item.id}>{item.name}</Typography>
        ))}
      </Stack>
    </SectionCard>
  )
}
