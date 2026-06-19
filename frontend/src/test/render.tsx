import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { CssBaseline, ThemeProvider } from '@mui/material'

import { buildTheme } from '../app/theme'

export function renderWithTheme(ui: ReactElement) {
  return render(
    <ThemeProvider theme={buildTheme('dark')}>
      <CssBaseline />
      {ui}
    </ThemeProvider>,
  )
}
