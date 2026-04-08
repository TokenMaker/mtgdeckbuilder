import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c9a94e',
      light: '#e0c876',
      dark: '#a08230',
    },
    secondary: {
      main: '#7b5ea7',
      light: '#a98dd4',
      dark: '#53397a',
    },
    background: {
      default: '#0d0d14',
      paper: '#16161f',
    },
    error: {
      main: '#e85454',
    },
    success: {
      main: '#4caf7d',
    },
    warning: {
      main: '#e8a54e',
    },
    text: {
      primary: '#e8e4dc',
      secondary: '#9e9a92',
    },
    divider: 'rgba(201, 169, 78, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '0.95rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.825rem',
      color: '#9e9a92',
    },
    body2: {
      fontSize: '0.85rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2a3d #0d0d14',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0d0d14',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2a2a3d',
            borderRadius: '3px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 16px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #c9a94e 0%, #e0c876 100%)',
          color: '#0d0d14',
          '&:hover': {
            background: 'linear-gradient(135deg, #d4b85a 0%, #e8d48a 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderColor: 'rgba(201, 169, 78, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#12121a',
          borderLeft: '1px solid rgba(201, 169, 78, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(201, 169, 78, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(201, 169, 78, 0.3)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e1e2d',
          border: '1px solid rgba(201, 169, 78, 0.15)',
          fontSize: '0.8rem',
        },
      },
    },
  },
});

export default theme;
