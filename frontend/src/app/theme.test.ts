import { describe, expect, it } from 'vitest'

import { buildTheme } from './theme'

describe('buildTheme', () => {
  it('builds a dark theme', () => {
    const theme = buildTheme('dark')

    expect(theme.palette.mode).toBe('dark')
    expect(theme.shape.borderRadius).toBe(16)
  })

  it('builds a light theme with the expected background', () => {
    const theme = buildTheme('light')

    expect(theme.palette.mode).toBe('light')
    expect(theme.palette.background.default).toBe('#eef3fb')
  })
})
