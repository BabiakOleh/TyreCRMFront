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
    <TableCell sx={{ width: 70 }}>
      <TextField
        value={quantity}
        onChange={(event) => onQuantityChange(event.target.value)}
        inputMode="numeric"
        size="small"
      />
    </TableCell>
    <TableCell sx={{ width: 110 }}>
      <TextField
        value={price}
        onChange={(event) => onPriceChange(event.target.value)}
        inputMode="decimal"
        size="small"
      />
    </TableCell>
  </>
)
