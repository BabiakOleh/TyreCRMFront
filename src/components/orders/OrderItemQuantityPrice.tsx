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
}: Props) => {
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.trim().replace(',', '.')
    if (raw === '') {
      onQuantityChange('')
      return
    }

    const num = Number(raw)
    if (Number.isNaN(num)) {
      return
    }

    if (num <= 0) {
      return
    }

    onQuantityChange(raw)
  }

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.trim().replace(',', '.')
    if (raw === '') {
      onPriceChange('')
      return
    }

    const num = Number(raw)
    if (Number.isNaN(num)) {
      return
    }

    if (num < 0) {
      return
    }

    onPriceChange(raw)
  }

  return (
    <>
      <TableCell sx={{ width: 70 }}>
        <TextField
          value={quantity}
          onChange={handleQuantityChange}
          inputMode="numeric"
          size="small"
        />
      </TableCell>
      <TableCell sx={{ width: 110 }}>
        <TextField
          value={price}
          onChange={handlePriceChange}
          inputMode="decimal"
          size="small"
        />
      </TableCell>
    </>
  )
}
