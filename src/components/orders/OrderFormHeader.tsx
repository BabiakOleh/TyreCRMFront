import { Box, MenuItem, TextField } from '@mui/material'

type Props = {
  counterpartyLabel: string
  counterpartyId: string
  onCounterpartyChange: (id: string) => void
  orderDate: string
  onOrderDateChange: (date: string) => void
  counterpartyOptions: Array<{ id: string; name: string }>
}

export const OrderFormHeader = ({
  counterpartyLabel,
  counterpartyId,
  onCounterpartyChange,
  orderDate,
  onOrderDateChange,
  counterpartyOptions
}: Props) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 2
    }}
  >
    <TextField
      select
      label={counterpartyLabel}
      value={counterpartyId}
      onChange={(event) => onCounterpartyChange(event.target.value)}
      fullWidth
    >
      {counterpartyOptions.map((option) => (
        <MenuItem key={option.id} value={option.id}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
    <TextField
      label="Дата"
      type="date"
      value={orderDate}
      onChange={(event) => onOrderDateChange(event.target.value)}
      slotProps={{
        inputLabel: { shrink: true }
      }}
      sx={{ minWidth: 180 }}
      fullWidth
    />
  </Box>
)
