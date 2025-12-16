import { createTheme, ThemeOptions } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';
import { COLORS } from '../theme/colors';

// RTL theme configuration
const themeOptions: ThemeOptions = {
  direction: 'rtl',
  palette: {
    primary: {
      main: COLORS.primary.main,
      light: COLORS.primary.light,
      dark: COLORS.primary.dark,
      contrastText: COLORS.primary.contrast,
    },
    secondary: {
      main: COLORS.secondary.main,
      light: COLORS.secondary.light,
      dark: COLORS.secondary.dark,
      contrastText: COLORS.secondary.contrast,
    },
    background: {
      default: COLORS.background.default,
      paper: COLORS.background.paper,
    },
    text: {
      primary: COLORS.text.primary,
      secondary: COLORS.text.secondary,
    },
    error: {
      main: COLORS.status.error,
      light: COLORS.status.errorLight,
      dark: COLORS.status.errorDark,
      contrastText: COLORS.text.onPrimary,
    },
    warning: {
      main: COLORS.status.warning,
      light: COLORS.status.warningLight,
      dark: COLORS.status.warningDark,
      contrastText: COLORS.text.onPrimary,
    },
    success: {
      main: COLORS.status.success,
      light: COLORS.status.successLight,
      dark: COLORS.status.successDark,
      contrastText: COLORS.text.onPrimary,
    },
    info: {
      main: COLORS.status.info,
      light: COLORS.status.infoLight,
      dark: COLORS.status.infoDark,
      contrastText: COLORS.text.onPrimary,
    },
    grey: COLORS.grey,
    action: {
      hover: COLORS.action.hover,
      selected: COLORS.action.selected,
      disabled: COLORS.action.disabled,
      disabledBackground: COLORS.action.disabledBackground,
      focus: COLORS.action.focus,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Sans Hebrew"',
      'Hebrew',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: 'rtl',
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Noto Sans Hebrew"',
            'Hebrew',
          ].join(','),
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          backgroundColor: COLORS.button.primaryBackground,
          color: COLORS.button.primaryText,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: COLORS.button.primaryBackgroundHover,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          },
          '&:disabled': {
            backgroundColor: COLORS.button.primaryBackgroundDisabled,
            color: COLORS.button.primaryTextDisabled,
          },
        },
        outlined: {
          backgroundColor: COLORS.button.secondaryBackground,
          color: COLORS.button.secondaryText,
          borderColor: COLORS.button.secondaryBorder,
          '&:hover': {
            backgroundColor: COLORS.button.secondaryBackgroundHover,
            color: COLORS.button.secondaryTextHover,
          },
        },
        text: {
          backgroundColor: COLORS.button.defaultBackground,
          color: COLORS.button.defaultText,
          '&:hover': {
            backgroundColor: COLORS.button.defaultBackgroundHover,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: COLORS.input.background,
            '& fieldset': {
              borderColor: COLORS.input.border,
            },
            '&:hover fieldset': {
              borderColor: COLORS.input.borderHover,
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.input.borderFocus,
            },
            '&.Mui-error fieldset': {
              borderColor: COLORS.input.borderError,
            },
          },
          '& .MuiInputLabel-root': {
            color: COLORS.input.label,
          },
          '& .MuiOutlinedInput-input': {
            color: COLORS.input.text,
            '&::placeholder': {
              color: COLORS.input.placeholder,
              opacity: 1,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: COLORS.card.background,
          boxShadow: `0 2px 8px ${COLORS.card.shadow}`,
          '&:hover': {
            boxShadow: `0 4px 12px ${COLORS.card.shadowHover}`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.navigation.background,
          color: COLORS.navigation.text,
          boxShadow: `0 2px 4px ${COLORS.navigation.shadow}`,
        },
      },
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
};

// Create the theme with RTL support and Hebrew locale
const theme = createTheme(themeOptions, heIL);

export default theme;
