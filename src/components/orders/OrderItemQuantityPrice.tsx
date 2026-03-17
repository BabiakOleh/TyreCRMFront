import { TableCell, TextField } from '@mui/material'

type Props = {
  quantity: string
  price: string
  onQuantityChange: (value: string) => void
  onPriceChange: (value: string) => void
}

export const OrderItemQuantityPrice = ({
  quantity,
  price,
  onQuantityChange,
  onPriceChange
}: Props) => (
  <>
    <TableCell>
      <TextField
        value={quantity}
        onChange={(event) => onQuantityChange(event.target.value)}
        inputMode="numeric"
      />
    </TableCell>
    <TableCell>
      <TextField
        value={price}
        onChange={(event) => onPriceChange(event.target.value)}
        inputMode="decimal"
      />
    </TableCell>
  </>
)
