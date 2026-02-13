import {
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { Content } from '../components/layout/PageLayout'
import { SectionCard } from '../components/shared/SectionCard'
import { useGetOrderByIdQuery } from '../store/api'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('uk-UA')

const formatMoney = (cents: number) => `${(cents / 100).toFixed(2)} грн`

export const SalesDetailsPage = () => {
  const { id } = useParams()
  const { data, isLoading, isError } = useGetOrderByIdQuery(id ?? '')

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6">Документ продажу</Typography>
        {isLoading && <CircularProgress size={28} />}
        {isError && <Alert severity="error">Не вдалося завантажити документ</Alert>}
        {data && (
          <>
            <Typography variant="body2">
              Номер: {data.documentNumber ?? data.id.slice(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="body2">
              Дата: {formatDate(data.orderDate)}
            </Typography>
            <Typography variant="body2">
              Клієнт: {data.counterparty?.name ?? '—'}
            </Typography>
            <Typography variant="body2">
              Сума: {formatMoney(data.totalCents)} UAH
            </Typography>
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Товар</TableCell>
                  <TableCell>К-сть</TableCell>
                  <TableCell>Ціна</TableCell>
                  <TableCell>Сума</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data.items ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>
                      {item.quantity}
                      {item.product.unit?.name ? ` ${item.product.unit.name}` : ''}
                    </TableCell>
                    <TableCell>{formatMoney(item.priceCents)}</TableCell>
                    <TableCell>{formatMoney(item.priceCents * item.quantity)}</TableCell>
                  </TableRow>
                ))}
                {(data.items ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>Немає позицій</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </SectionCard>
    </Content>
  )
}
