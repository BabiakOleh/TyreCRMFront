import { Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { TABLE_HEADERS } from '../../constants/labels'
import { OrderItemsTableBody } from './OrderItemsTableBody'

type BaseRow = {
  rowId: string
  quantity: string
  price: string
}

type QuantityMeta = {
  maxQuantity?: number
  quantityError?: string | null
}

type Props<T extends BaseRow> = {
  items: T[]
  canRemove: boolean
  renderLeadingCells: (item: T) => React.ReactNode
  getRowTotalCents: (item: T) => number
  onQuantityChange: (rowId: string, value: string) => void
  onPriceChange: (rowId: string, value: string) => void
  onRemove: (rowId: string) => void
  getQuantityMeta?: (item: T) => QuantityMeta
}

export const OrderItemsTable = <T extends BaseRow>(props: Props<T>) => (
  <TableContainer>
    <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '46%' }}>{TABLE_HEADERS.product}</TableCell>
          <TableCell sx={{ width: '10%' }}>{TABLE_HEADERS.quantity}</TableCell>
          <TableCell sx={{ width: '19%' }}>{TABLE_HEADERS.price}</TableCell>
          <TableCell sx={{ width: '15%' }}>{TABLE_HEADERS.amount}</TableCell>
          <TableCell sx={{ width: '10%' }} />
        </TableRow>
      </TableHead>
      <OrderItemsTableBody {...props} />
    </Table>
  </TableContainer>
)

