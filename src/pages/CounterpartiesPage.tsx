import { useMemo, useState, type SyntheticEvent } from 'react'
import { useFormik } from 'formik'
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined'
import { Content } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import {
  useCreateCounterpartyMutation,
  useDeleteCounterpartyMutation,
  useGetCounterpartiesQuery,
  useSetCounterpartyStatusMutation,
  useUpdateCounterpartyMutation
} from '../store/api'
import type { Counterparty, CounterpartyType } from '../types/counterparty'

const defaultValues = (type: CounterpartyType) => ({
  type,
  name: '',
  phone: '',
  email: '',
  taxId: '',
  address: '',
  note: ''
})

const normalizePhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, '')
  const withoutCountry = digits.startsWith('38') ? digits.slice(2) : digits
  return withoutCountry.slice(0, 10)
}

const formatPhone = (digits: string) => {
  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 8)
  const part4 = digits.slice(8, 10)
  if (digits.length === 0) {
    return '+38('
  }
  if (digits.length <= 3) {
    return `+38(${part1}`
  }
  if (digits.length <= 6) {
    return `+38(${part1})${part2}`
  }
  if (digits.length <= 8) {
    return `+38(${part1})${part2}-${part3}`
  }
  return `+38(${part1})${part2}-${part3}-${part4}`
}

export const CounterpartiesPage = () => {
  const [type, setType] = useState<CounterpartyType>('CUSTOMER')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  const { data, isLoading, isError } = useGetCounterpartiesQuery({
    type,
    q: search,
    includeInactive: showInactive
  })
  const [createCounterparty, { isLoading: isCreating }] = useCreateCounterpartyMutation()
  const [updateCounterparty, { isLoading: isUpdating }] = useUpdateCounterpartyMutation()
  const [deleteCounterparty, { isLoading: isDeleting }] = useDeleteCounterpartyMutation()
  const [setCounterpartyStatus, { isLoading: isToggling }] =
    useSetCounterpartyStatusMutation()

  const formik = useFormik({
    initialValues: defaultValues(type),
    enableReinitialize: true,
    validate: (values) => {
      const errors: Partial<Record<keyof typeof values, string>> = {}
      if (!values.name.trim()) {
        errors.name = 'Вкажи назву'
      } else if (values.name.trim().length < 3) {
        errors.name = 'Мінімум 3 символи'
      }
      if (!values.phone.trim()) {
        errors.phone = 'Вкажи телефон'
      } else if (values.phone.trim().length !== 10) {
        errors.phone = 'Формат: 0676733950'
      }
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        errors.email = 'Невірний email'
      }
      if (values.taxId && values.taxId.trim().length < 5) {
        errors.taxId = 'Мінімум 5 символів'
      }
      if (values.address && values.address.trim().length < 3) {
        errors.address = 'Мінімум 3 символи'
      }
      return errors
    },
    onSubmit: async (values, helpers) => {
      if (editingId) {
        await updateCounterparty({ id: editingId, ...values }).unwrap()
      } else {
        await createCounterparty(values).unwrap()
      }
      helpers.resetForm({ values: defaultValues(type) })
      setEditingId(null)
    }
  })

  const onTabChange = (_: SyntheticEvent, value: CounterpartyType) => {
    setType(value)
    setEditingId(null)
    formik.resetForm({ values: defaultValues(value) })
  }

  const startEdit = (item: Counterparty) => {
    setEditingId(item.id)
    formik.setValues({
      type: item.type,
      name: item.name ?? '',
      phone: item.phone ?? '',
      email: item.email ?? '',
      taxId: item.taxId ?? '',
      address: item.address ?? '',
      note: item.note ?? ''
    })
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Деактивувати контрагента?')) {
      await deleteCounterparty(id).unwrap()
      if (editingId === id) {
        setEditingId(null)
        formik.resetForm({ values: defaultValues(type) })
      }
    }
  }

  const handleRestore = async (id: string) => {
    await setCounterpartyStatus({ id, isActive: true }).unwrap()
  }

  const rows = useMemo(() => data ?? [], [data])
  const isSupplier = type === 'SUPPLIER'
  const formatMoney = (cents?: number) =>
    typeof cents === 'number' ? `${(cents / 100).toFixed(2)} грн` : '—'

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6">Контрагенти</Typography>
        <Tabs value={type} onChange={onTabChange}>
          <Tab label="Клієнти" value="CUSTOMER" />
          <Tab label="Постачальники" value="SUPPLIER" />
        </Tabs>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Пошук"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Назва, телефон, ЄДРПОУ"
            fullWidth
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Неактивні</Typography>
            <Switch
              checked={showInactive}
              onChange={(event) => setShowInactive(event.target.checked)}
            />
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            label="Назва"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name ? formik.errors.name : ' '}
            fullWidth
          />
          <TextField
            label="Телефон"
            name="phone"
            value={formatPhone(formik.values.phone)}
            onChange={(event) =>
              formik.setFieldValue('phone', normalizePhoneInput(event.target.value))
            }
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.phone && formik.errors.phone)}
            helperText={formik.touched.phone ? formik.errors.phone : ' '}
            fullWidth
            inputMode="numeric"
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            label="Email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.email && formik.errors.email)}
            helperText={formik.touched.email ? formik.errors.email : ' '}
            fullWidth
          />
          <TextField
            label="ЄДРПОУ/ІПН"
            name="taxId"
            value={formik.values.taxId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.taxId && formik.errors.taxId)}
            helperText={formik.touched.taxId ? formik.errors.taxId : ' '}
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            label="Адреса"
            name="address"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.address && formik.errors.address)}
            helperText={formik.touched.address ? formik.errors.address : ' '}
            fullWidth
          />
          <TextField
            label="Примітка"
            name="note"
            value={formik.values.note}
            onChange={formik.handleChange}
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={() => formik.handleSubmit()}
            disabled={!formik.isValid || isCreating || isUpdating}
          >
            {editingId ? 'Зберегти зміни' : 'Додати'}
          </Button>
          {editingId && (
            <Button
              variant="outlined"
              onClick={() => {
                setEditingId(null)
                formik.resetForm({ values: defaultValues(type) })
              }}
            >
              Скасувати
            </Button>
          )}
        </Stack>

        {isLoading && <CircularProgress size={28} />}
        {isError && <Alert severity="error">Не вдалося завантажити контрагентів</Alert>}

        {!isLoading && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Назва</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Email</TableCell>
                {isSupplier && <TableCell>Заборгованість</TableCell>}
                <TableCell>Статус</TableCell>
                <TableCell>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.email || '—'}</TableCell>
                  {isSupplier && (
                    <TableCell>{formatMoney(item.payableCents)}</TableCell>
                  )}
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.isActive ? 'Активний' : 'Неактивний'}
                      color={item.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => startEdit(item)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    {item.isActive ? (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                      >
                        <DeleteForeverOutlinedIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleRestore(item.id)}
                        disabled={isToggling}
                      >
                        <RestoreFromTrashOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </Content>
  )
}
