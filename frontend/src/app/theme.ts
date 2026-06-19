import { createTheme, type PaletteMode } from '@mui/material/styles'

export function buildTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#7c9cff' : '#355dfb',
      },
      secondary: {
        main: isDark ? '#5de1c8' : '#0f766e',
      },
      background: {
        default: isDark ? '#07111f' : '#eef3fb',
        paper: isDark ? '#0e1a2f' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e7eefc' : '#0f172a',
        secondary: isDark ? '#9aa8c5' : '#526072',
      },
      divider: isDark ? 'rgba(153, 173, 208, 0.16)' : 'rgba(15, 23, 42, 0.12)',
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h1: {
        fontWeight: 800,
        letterSpacing: 0,
      },
      h2: {
        fontWeight: 800,
        letterSpacing: 0,
      },
      h3: {
        fontWeight: 700,
        letterSpacing: 0,
      },
      button: {
        textTransform: 'none',
        fontWeight: 700,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? 'radial-gradient(circle at top left, rgba(92, 119, 255, 0.14), transparent 36%), radial-gradient(circle at bottom right, rgba(93, 225, 200, 0.08), transparent 34%)'
              : 'linear-gradient(180deg, rgba(53, 93, 251, 0.04), transparent 22%)',
            backgroundColor: isDark ? '#07111f' : '#eef3fb',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  })
}
