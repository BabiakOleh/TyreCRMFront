import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useNavigate } from 'react-router-dom'
import type { Order } from '../../types/order'
import { formatDate, formatMoney } from '../../utils/money'
import { getStatusColor, getStatusLabel, canEditOrder } from '../../utils/orderStatus'
import { OrderStatusActions } from './OrderStatusActions'
import { TABLE_HEADERS } from '../../constants/labels'
import { ERROR_MESSAGES } from '../../constants/messages'

type Props = {
  orders: Order[]
  isLoading: boolean
  isError: boolean
  basePath: '/purchases' | '/sales'
  counterpartyColumnLabel: string
  onEdit: (id: string) => void
}

export const OrdersTable = ({
  orders,
  isLoading,
  isError,
  basePath,
  counterpartyColumnLabel,
  onEdit
}: Props) => {
  const navigate = useNavigate()

  return (
    <>
      {isLoading && <CircularProgress size={28} />}
      {isError && (
        <Alert severity="error">
          {ERROR_MESSAGES.loadOrders}
        </Alert>
      )}
      {!isLoading && (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{TABLE_HEADERS.date}</TableCell>
                <TableCell>{TABLE_HEADERS.documentNumber}</TableCell>
                <TableCell>{counterpartyColumnLabel}</TableCell>
                <TableCell>{TABLE_HEADERS.amount}</TableCell>
                <TableCell>{TABLE_HEADERS.currency}</TableCell>
                <TableCell>{TABLE_HEADERS.status}</TableCell>
                <TableCell>{TABLE_HEADERS.details}</TableCell>
                <TableCell>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <TableCell sx={{ py: 1.5 }}>{formatDate(order.orderDate)}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {order.documentNumber ?? order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    {order.counterparty?.name ?? '—'}
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>{formatMoney(order.totalCents)}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>UAH</TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Chip
                      size="small"
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Button size="small" onClick={() => navigate(`${basePath}/${order.id}`)}>
                      Відкрити
                    </Button>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <OrderStatusActions orderId={order.id} status={order.status} compact />
                      <IconButton
                        size="small"
                        disabled={!canEditOrder(order.status)}
                        onClick={() => onEdit(order.id)}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell sx={{ py: 1.5 }} colSpan={8}>
                    Немає даних
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
