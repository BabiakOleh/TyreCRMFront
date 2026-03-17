import { Button, Stack } from '@mui/material'

type Props = {
  onSubmit: () => Promise<void>
  onCancel?: () => void
  isEditing: boolean
  isCreating: boolean
  isUpdating: boolean
}

export const OrderFormActions = ({
  onSubmit,
  onCancel,
  isEditing,
  isCreating,
  isUpdating
}: Props) => (
  <Stack direction="row" spacing={2}>
    <Button
      variant="contained"
      onClick={onSubmit}
      disabled={isCreating || isUpdating}
    >
      {isEditing
        ? isUpdating
          ? 'Оновлюю...'
          : 'Зберегти зміни'
        : isCreating
          ? 'Зберігаю...'
          : 'Створити документ'}
    </Button>
    {onCancel && (
      <Button variant="outlined" onClick={onCancel}>
        Скасувати
      </Button>
    )}
  </Stack>
)
