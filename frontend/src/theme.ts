import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    background: { default: '#f3f5f9', paper: '#ffffff' },
    primary: { main: '#4f5bd5' },
    success: { main: '#1a9c6b' },
    warning: { main: '#b7791f' },
    error: { main: '#d64545' },
    text: { primary: '#1c2130', secondary: '#6b7280' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(20,24,40,0.04), 0 8px 24px rgba(20,24,40,0.05)',
          border: '1px solid #e7e9f0',
        },
      },
    },
  },
});