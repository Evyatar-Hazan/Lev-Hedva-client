import React, { useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';

interface RTLThemeProviderProps {
  children: React.ReactNode;
}

const RTLThemeProvider: React.FC<RTLThemeProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  // Create cache for RTL and LTR
  const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [rtlPlugin],
  });

  const cacheLtr = createCache({
    key: 'muiltr',
  });

  // Update document direction when language changes
  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  // Create theme based on direction
  const theme = createTheme({
    direction: isRTL ? 'rtl' : 'ltr',
    palette: {
      mode: 'light',
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
          html: {
            direction: isRTL ? 'rtl' : 'ltr',
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
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              direction: isRTL ? 'rtl' : 'ltr',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            '&.Mui-selected': {
              backgroundColor: COLORS.action.selected,
              '&:hover': {
                backgroundColor: COLORS.action.hoverStrong,
              },
            },
          },
        },
      },
    },
  });

  return (
    <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
};

export default RTLThemeProvider;