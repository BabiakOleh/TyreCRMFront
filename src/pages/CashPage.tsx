import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
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
import { Content } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import {
  useCreateCashDocumentMutation,
  useGetCashDocumentsQuery,
  useGetCounterpartiesQuery,
  useGetReportSummaryQuery
} from '../store/api'
import { formatDate, formatMoney, parseMoneyToCents } from '../utils/money'
import type { CashDocumentSubtype, CashDocumentType } from '../types/cash'

const subtypeLabels: Record<CashDocumentSubtype, string> = {
  SUPPLIER_PAYMENT: 'Оплата постачальнику',
  OTHER_EXPENSE: 'Інший розхід',
  CUSTOMER_PAYMENT: 'Оплата від клієнта',
  OTHER_INCOME: 'Інший прихід'
}

const typeLabel = (t: CashDocumentType) => (t === 'INCOME' ? 'Прихід' : 'Розхід')

export const CashPage = () => {
  const { data: balanceReport } = useGetReportSummaryQuery()
  const { data: docs = [], isLoading, isError } = useGetCashDocumentsQuery({})

  const [flowType, setFlowType] = useState<CashDocumentType>('INCOME')
  const [subtype, setSubtype] = useState<CashDocumentSubtype>('CUSTOMER_PAYMENT')
  const [counterpartyId, setCounterpartyId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { data: suppliers = [] } = useGetCounterpartiesQuery({
    type: 'SUPPLIER',
    includeInactive: false
  })
  const { data: customers = [] } = useGetCounterpartiesQuery({
    type: 'CUSTOMER',
    includeInactive: false
  })

  const [createDoc, { isLoading: isSaving }] = useCreateCashDocumentMutation()

  const subtypeOptions = useMemo((): CashDocumentSubtype[] => {
    return flowType === 'INCOME'
      ? ['CUSTOMER_PAYMENT', 'OTHER_INCOME']
      : ['SUPPLIER_PAYMENT', 'OTHER_EXPENSE']
  }, [flowType])

  const needsCounterparty =
    subtype === 'SUPPLIER_PAYMENT' || subtype === 'CUSTOMER_PAYMENT'

  const counterpartyOptions =
    subtype === 'SUPPLIER_PAYMENT' ? suppliers : subtype === 'CUSTOMER_PAYMENT' ? customers : []

  const handleSubmit = async () => {
    setFormError(null)
    const amountCents = parseMoneyToCents(amount)
    if (!amount || amountCents <= 0) {
      setFormError('Вкажіть суму більшу за нуль')
      return
    }
    if (needsCounterparty && !counterpartyId) {
      setFormError('Оберіть контрагента')
      return
    }
    try {
      await createDoc({
        date: new Date(`${date}T12:00:00`).toISOString(),
        type: flowType,
        subtype,
        counterpartyId: needsCounterparty ? counterpartyId : undefined,
        amountCents,
        note: note.trim() || undefined
      }).unwrap()
      setAmount('')
      setNote('')
      setCounterpartyId('')
    } catch {
      setFormError('Не вдалося зберегти (перевірте залишок каси для розходу)')
    }
  }

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6" gutterBottom>
          Каса
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Баланс: {formatMoney(balanceReport?.cashBalanceCents ?? 0)}
        </Typography>

        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <TextField
            select
            label="Напрям"
            value={flowType}
            onChange={(e) => {
              const v = e.target.value as CashDocumentType
              setFlowType(v)
              setSubtype(v === 'INCOME' ? 'CUSTOMER_PAYMENT' : 'SUPPLIER_PAYMENT')
              setCounterpartyId('')
            }}
            size="small"
          >
            <MenuItem value="INCOME">Прихід</MenuItem>
            <MenuItem value="EXPENSE">Розхід</MenuItem>
          </TextField>

          <TextField
            select
            label="Тип операції"
            value={subtype}
            onChange={(e) => {
              setSubtype(e.target.value as CashDocumentSubtype)
              setCounterpartyId('')
            }}
            size="small"
          >
            {subtypeOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {subtypeLabels[s]}
              </MenuItem>
            ))}
          </TextField>

          {needsCounterparty && (
            <TextField
              select
              label={subtype === 'SUPPLIER_PAYMENT' ? 'Постачальник' : 'Клієнт'}
              value={counterpartyId}
              onChange={(e) => setCounterpartyId(e.target.value)}
              size="small"
              fullWidth
            >
              {counterpartyOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Сума (грн)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            size="small"
          />
          <TextField
            label="Дата"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Коментар"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            size="small"
            multiline
            minRows={2}
          />
          {formError && <Alert severity="error">{formError}</Alert>}
          <Button variant="contained" onClick={() => void handleSubmit()} disabled={isSaving}>
            Зберегти
          </Button>
        </Stack>
      </SectionCard>

      <SectionCard>
        <Typography variant="h6" gutterBottom>
          Журнал операцій
        </Typography>
        {isLoading && <Typography>Завантаження…</Typography>}
        {isError && <Alert severity="error">Не вдалося завантажити журнал</Alert>}
        {!isLoading && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Операція</TableCell>
                <TableCell>Контрагент</TableCell>
                <TableCell align="right">Сума</TableCell>
                <TableCell>Коментар</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {docs.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell>{typeLabel(row.type)}</TableCell>
                  <TableCell>{subtypeLabels[row.subtype]}</TableCell>
                  <TableCell>{row.counterparty?.name ?? '—'}</TableCell>
                  <TableCell align="right">{formatMoney(row.amountCents)}</TableCell>
                  <TableCell>{row.note ?? '—'}</TableCell>
                </TableRow>
              ))}
              {docs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    Немає операцій
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </Content>
  )
}
