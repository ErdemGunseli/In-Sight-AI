// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({

  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#eeeeee',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5c8d',
      dark: '#9a0036',
      contrastText: '#000000',
    },
    background: {
      default: '#ededed',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999'
    },
  },
  

  components: {

    MuiTypography: {
      styleOverrides: {
        root: {
          margin: 2,
        },
        title: {
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #6a5acd 0%, #1976d2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent',
        },
        subtitle: {
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: '#1976d2',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          borderRadius: 20,
          textTransform: 'none',
          backgroundImage: 'linear-gradient(135deg, #6a5acd 0%, #1976d2 20%, #1976d2 80%, #6a5acd 100%)',
          color: '#ffffff',
          '&:hover': {
            backgroundImage: 'linear-gradient(135deg, #6a5acd 0%, #2976d2 40%, #2976d2 60%, #6a5acd 100%)',
          },
        },
        text: {
          fontSize: '1rem',
          color: '#1976d2',
          backgroundImage: 'none',
          '&:hover': {
            backgroundImage: 'none',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          backgroundColor: '#f2f2f2',
        },
      },
    },


    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },

    MuiAppBar: {
      // Using 'styleOverrides' allows us to access theme-specific values:
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }),
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          marginRight: 2,
        },
      },
    },
  },

  spacing: 8,
});

export default theme;



