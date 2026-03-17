import { IconButton } from '@mui/material'
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined'

type Props = {
  onRemove: () => void
  disabled?: boolean
}

export const RemoveRowButton = ({ onRemove, disabled }: Props) => (
  <IconButton
    size="small"
    color="error"
    onClick={onRemove}
    disabled={disabled}
  >
    <DeleteForeverOutlinedIcon fontSize="small" />
  </IconButton>
)
