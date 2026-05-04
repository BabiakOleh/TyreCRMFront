import { useState } from 'react'
import {
  Alert,
  Button,
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
import { useGetReportSummaryQuery } from '../store/api'
import { formatMoney } from '../utils/money'

export const ReportPage = () => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [applied, setApplied] = useState<{ from?: string; to?: string }>({})

  const { data, isLoading, isError } = useGetReportSummaryQuery(applied)

  const applyFilters = () => {
    const next: { from?: string; to?: string } = {}
    if (from) next.from = from
    if (to) next.to = to
    setApplied(next)
  }

  const tires = data?.tiresStats
  const marginPct =
    tires?.averageMargin != null ? (tires.averageMargin - 1) * 100 : null

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6" gutterBottom>
          Параметри звіту
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Від"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="До"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button variant="contained" onClick={applyFilters}>
            Застосувати
          </Button>
        </Stack>
      </SectionCard>

      {isLoading && <Typography sx={{ px: 2 }}>Завантаження…</Typography>}
      {isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Не вдалося завантажити звіт
        </Alert>
      )}

      {data && (
        <Stack spacing={3}>
          <SectionCard>
            <Typography variant="subtitle1" color="text.secondary">
              Каса (поточний баланс)
            </Typography>
            <Typography variant="h5">{formatMoney(data.cashBalanceCents)}</Typography>
          </SectionCard>

          <SectionCard>
            <Typography variant="h6" gutterBottom>
              Борги постачальникам
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Постачальник</TableCell>
                  <TableCell align="right">Закупівлі</TableCell>
                  <TableCell align="right">Оплати</TableCell>
                  <TableCell align="right">Борг</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.supplierDebts.map((row) => (
                  <TableRow key={row.supplier.id}>
                    <TableCell>{row.supplier.name}</TableCell>
                    <TableCell align="right">{formatMoney(row.purchasesCents)}</TableCell>
                    <TableCell align="right">{formatMoney(row.paymentsCents)}</TableCell>
                    <TableCell align="right">{formatMoney(row.debtCents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>

          <SectionCard>
            <Typography variant="h6" gutterBottom>
              Борги клієнтів
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Клієнт</TableCell>
                  <TableCell align="right">Продажі</TableCell>
                  <TableCell align="right">Оплати</TableCell>
                  <TableCell align="right">Борг</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.customerDebts.map((row) => (
                  <TableRow key={row.customer.id}>
                    <TableCell>{row.customer.name}</TableCell>
                    <TableCell align="right">{formatMoney(row.salesCents)}</TableCell>
                    <TableCell align="right">{formatMoney(row.paymentsCents)}</TableCell>
                    <TableCell align="right">{formatMoney(row.debtCents)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>

          <SectionCard>
            <Typography variant="h6" gutterBottom>
              Продажі по клієнтах (період)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Клієнт</TableCell>
                  <TableCell align="right">Сума</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.salesByCustomer.map((row) => (
                  <TableRow key={row.customer.id}>
                    <TableCell>{row.customer.name}</TableCell>
                    <TableCell align="right">{formatMoney(row.salesCents)}</TableCell>
                  </TableRow>
                ))}
                {data.salesByCustomer.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>Немає даних за період</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SectionCard>

          <SectionCard>
            <Typography variant="h6" gutterBottom>
              Закупки по постачальниках (період)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Постачальник</TableCell>
                  <TableCell align="right">Сума</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.purchasesBySupplier.map((row) => (
                  <TableRow key={row.supplier.id}>
                    <TableCell>{row.supplier.name}</TableCell>
                    <TableCell align="right">{formatMoney(row.purchasesCents)}</TableCell>
                  </TableRow>
                ))}
                {data.purchasesBySupplier.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>Немає даних за період</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SectionCard>

          <SectionCard>
            <Typography variant="h6" gutterBottom>
              Шини (період)
            </Typography>
            <Typography variant="body2">
              Продано шт.: {tires?.totalQuantity ?? 0}
            </Typography>
            <Typography variant="body2">
              Середня ціна за шину:{' '}
              {tires?.averagePricePerTire != null
                ? formatMoney(tires.averagePricePerTire)
                : '—'}
            </Typography>
            <Typography variant="body2">
              Маржа (над закупівлею):{' '}
              {marginPct != null && Number.isFinite(marginPct)
                ? `${marginPct.toFixed(1)}%`
                : '—'}
            </Typography>
          </SectionCard>
        </Stack>
      )}
    </Content>
  )
}
