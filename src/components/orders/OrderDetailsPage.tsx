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
import { Content } from '../layout/PageLayout'
import { SectionCard } from '../shared/SectionCard'
import { useGetOrderByIdQuery } from '../../store/api'
import { formatDate, formatMoney } from '../../utils/money'

type Props = {
  title: string
  counterpartyLabel: string
}

export const OrderDetailsPage = ({ title, counterpartyLabel }: Props) => {
  const { id } = useParams()
  const { data, isLoading, isError } = useGetOrderByIdQuery(id ?? '')

  return (
    <Content>
      <SectionCard>
        <Typography variant="h6">{title}</Typography>
        {isLoading && <CircularProgress size={28} />}
        {isError && <Alert severity="error">Не вдалося завантажити документ</Alert>}
        {data && (
          <>
            <Typography variant="body2">
              Номер: {data.documentNumber ?? data.id.slice(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="body2">Дата: {formatDate(data.orderDate)}</Typography>
            <Typography variant="body2">
              {counterpartyLabel}: {data.counterparty?.name ?? '—'}
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
