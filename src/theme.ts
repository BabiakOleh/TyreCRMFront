import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb'
    },
    secondary: {
      main: '#64748b'
    },
    background: {
      default: '#f8fafc'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif'
  },
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small'
      }
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true
      }
    }
  }
})
