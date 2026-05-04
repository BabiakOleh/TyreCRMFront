import { Box, Button, ButtonGroup } from '@mui/material'
import type { Order } from '../../types/order'
import {
  getAvailableTransitions,
  transitionLabel
} from '../../utils/orderStatus'
import { useUpdateOrderStatusMutation } from '../../store/api'

type Props = {
  orderId: string
  status: Order['status']
  compact?: boolean
}

export const OrderStatusActions = ({ orderId, status, compact }: Props) => {
  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation()
  const transitions = getAvailableTransitions(status)

  const handle = async (next: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    if (next === 'CANCELLED') {
      const ok = window.confirm('Скасувати замовлення?')
      if (!ok) return
    }
    await updateStatus({ id: orderId, status: next }).unwrap()
  }

  if (transitions.length === 0) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 0.5 : 1 }}>
      <ButtonGroup size={compact ? 'small' : 'medium'} variant="outlined">
        {transitions.map((st) => (
          <Button
            key={st}
            disabled={isLoading}
            onClick={() => void handle(st)}
          >
            {transitionLabel(st)}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  )
}
