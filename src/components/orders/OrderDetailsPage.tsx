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
import { TABLE_HEADERS } from '../../constants/labels'
import { ERROR_MESSAGES } from '../../constants/messages'

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
        {isError && <Alert severity="error">{ERROR_MESSAGES.loadDocument}</Alert>}
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
              {TABLE_HEADERS.amount}: {formatMoney(data.totalCents)}
            </Typography>
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{TABLE_HEADERS.product}</TableCell>
                  <TableCell>{TABLE_HEADERS.quantity}</TableCell>
                  <TableCell>{TABLE_HEADERS.price}</TableCell>
                  <TableCell>{TABLE_HEADERS.amount}</TableCell>
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
