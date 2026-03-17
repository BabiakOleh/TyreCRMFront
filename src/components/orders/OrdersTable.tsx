import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
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
          Не вдалося завантажити {basePath === '/purchases' ? 'закупки' : 'продажі'}
        </Alert>
      )}
      {!isLoading && (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Дата</TableCell>
                <TableCell>Номер документа</TableCell>
                <TableCell>{counterpartyColumnLabel}</TableCell>
                <TableCell>Сума</TableCell>
                <TableCell>Валюта</TableCell>
                <TableCell>Деталі</TableCell>
                <TableCell />
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
                    <Button size="small" onClick={() => navigate(`${basePath}/${order.id}`)}>
                      Відкрити
                    </Button>
                  </TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <IconButton size="small" onClick={() => onEdit(order.id)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell sx={{ py: 1.5 }} colSpan={7}>
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
