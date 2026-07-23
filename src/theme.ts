import { createTheme } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: '"Montserrat", Arial, sans-serif',
    fontWeightBold: 700,
  },
  palette: {
    mode: 'dark',
    primary: { main: '#0d4f8b', contrastText: '#fff' },
    secondary: { main: '#1fb760', contrastText: '#fff' },
    background: {
      default: '#07101d',
      paper: '#0d1b2c',
    },
    text: {
      primary: '#e9eef5',
      secondary: '#a7b4c7',
    },
    divider: '#20324a'
  },
  shape: { borderRadius: 14 }
});