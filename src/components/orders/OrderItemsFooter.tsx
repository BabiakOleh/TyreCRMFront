import { Button, Stack, Typography } from '@mui/material'
import { formatMoney } from '../../utils/money'

type Props = {
  onAddRow: () => void
  totalCents: number
}

export const OrderItemsFooter = ({ onAddRow, totalCents }: Props) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Button variant="outlined" onClick={onAddRow}>
      Додати позицію
    </Button>
    <Typography variant="subtitle2">Разом: {formatMoney(totalCents)}</Typography>
  </Stack>
)
