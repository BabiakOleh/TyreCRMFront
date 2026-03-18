import { TableBody, TableRow, TableCell } from '@mui/material'
import { OrderItemQuantityPrice } from './OrderItemQuantityPrice'
import { RemoveRowButton } from './RemoveRowButton'
import { formatMoney } from '../../utils/money'

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

export const OrderItemsTableBody = <T extends BaseRow>({
  items,
  canRemove,
  renderLeadingCells,
  getRowTotalCents,
  onQuantityChange,
  onPriceChange,
  onRemove,
  getQuantityMeta
}: Props<T>) => (
  <TableBody>
    {items.map((item) => {
      const rowTotalCents = getRowTotalCents(item)
      const quantityMeta = getQuantityMeta ? getQuantityMeta(item) : {}

      return (
        <TableRow
          key={item.rowId}
          sx={{
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          {renderLeadingCells(item)}
          <OrderItemQuantityPrice
            quantity={item.quantity}
            price={item.price}
            onQuantityChange={(value: string) => onQuantityChange(item.rowId, value)}
            onPriceChange={(value: string) => onPriceChange(item.rowId, value)}
            maxQuantity={quantityMeta.maxQuantity}
            quantityError={quantityMeta.quantityError}
          />
          <TableCell sx={{ py: 1.5 }}>{formatMoney(rowTotalCents)}</TableCell>
          <TableCell sx={{ py: 1.5 }}>
            <RemoveRowButton onRemove={() => onRemove(item.rowId)} disabled={!canRemove} />
          </TableCell>
        </TableRow>
      )
    })}
  </TableBody>
)

