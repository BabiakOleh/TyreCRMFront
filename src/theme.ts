import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1d4ed8'
    },
    secondary: {
      main: '#0f766e'
    },
    background: {
      default: '#f4f6fb'
    }
  },
  shape: {
    borderRadius: 12
  }
})
