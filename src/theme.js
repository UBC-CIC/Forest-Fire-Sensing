import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff9800',  // Orange color for primary theme
    },
    secondary: {
      main: '#000000',  // Black color for secondary theme
    },
    error: {
      main: '#ff0000',  // Red color for errors
    },
    background: {
      default: '#ffffff',  // White color for general background
      paper: '#ffffff',    // White color for paper elements
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',  // Modern font family
    h1: { fontSize: '2.5rem' },
    body1: { fontSize: '1rem' },
  },
});

export default theme;
