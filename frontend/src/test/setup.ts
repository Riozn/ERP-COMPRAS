import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('@mui/material', async () => {
  const React = await import('react')

  const createStub = (tag: keyof React.JSX.IntrinsicElements) =>
    React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) =>
      React.createElement(tag, { ...props, ref }, children),
    )

  const TextField = React.forwardRef<
    HTMLInputElement | HTMLSelectElement,
    {
      label?: string
      type?: string
      value?: string
      onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>
      error?: boolean
      helperText?: React.ReactNode
      select?: boolean
      children?: React.ReactNode
      fullWidth?: boolean
      slotProps?: {
        inputLabel?: { shrink?: boolean }
        htmlInput?: Record<string, unknown>
      }
    } & React.ComponentPropsWithoutRef<'input'>
  >(({ label, type = 'text', value, onChange, helperText, select, children, slotProps, ...props }, ref) => {
    const id = props.id ?? (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    if (select) {
      return React.createElement(
        'label',
        { htmlFor: id },
        React.createElement('span', null, label),
        React.createElement(
          'select',
          {
            id,
            value,
            onChange,
            ref,
            ...props,
          },
          children,
        ),
        helperText ? React.createElement('div', null, helperText) : null,
      )
    }

    return React.createElement(
      'label',
      { htmlFor: id },
      React.createElement('span', null, label),
      React.createElement('input', {
        id,
        type,
        value,
        onChange,
        ref,
        ...props,
        ...(slotProps?.htmlInput ?? {}),
      }),
      helperText ? React.createElement('div', null, helperText) : null,
    )
  })

  const Tabs = ({
    children,
    onChange,
  }: {
    children?: React.ReactNode
    onChange?: (event: React.SyntheticEvent, value: unknown) => void
  }) =>
    React.createElement(
      'div',
      { role: 'tablist' },
      React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child
        }

        const childProps = child.props as { value?: unknown }

        return React.cloneElement(child as React.ReactElement<{ value?: unknown; onClick?: () => void }>, {
          onClick: () => onChange?.({} as React.SyntheticEvent, childProps.value),
        })
      }),
    )

  const Tab = ({
    label,
    children,
    onClick,
  }: {
    label?: React.ReactNode
    children?: React.ReactNode
    onClick?: () => void
  }) =>
    React.createElement(
      'button',
      { type: 'button', role: 'tab', onClick },
      label ?? children,
    )

  const ButtonGroup = ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { role: 'group' }, children)

  const Stack = ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'div'> & { children?: React.ReactNode }) =>
    React.createElement('div', props, children)

  const ToggleButton = ({
    children,
    value,
    onClick,
  }: {
    children?: React.ReactNode
    value?: unknown
    onClick?: () => void
  }) =>
    React.createElement(
      'button',
      {
        type: 'button',
        'data-value': value as string | undefined,
        onClick,
      },
      children,
    )

  const ToggleButtonGroup = ({
    children,
    onChange,
  }: {
    children?: React.ReactNode
    onChange?: (event: React.SyntheticEvent, value: unknown) => void
  }) =>
    React.createElement(
      'div',
      { role: 'group' },
      React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child
        }

        const childProps = child.props as { value?: unknown }

        return React.cloneElement(child as React.ReactElement<{ value?: unknown; onClick?: () => void }>, {
          onClick: () => onChange?.({} as React.SyntheticEvent, childProps.value),
        })
      }),
    )

  const MenuItem = ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'option'> & { children?: React.ReactNode }) =>
    React.createElement('option', props, children)

  const Alert = ({
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'div'> & { severity?: string }) =>
    React.createElement('div', { role: 'alert', ...props }, children)

  const ThemeProvider = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)

  const useMediaQuery = () => false

  return {
    __esModule: true,
    ThemeProvider,
    CssBaseline: () => null,
    Box: createStub('div'),
    Paper: createStub('div'),
    Container: createStub('div'),
    Typography: createStub('div'),
    Button: React.forwardRef<
      HTMLButtonElement,
      React.ComponentPropsWithoutRef<'button'> & {
        startIcon?: React.ReactNode
        endIcon?: React.ReactNode
        component?: React.ElementType
        to?: string
        fullWidth?: boolean
        variant?: string
      }
    >(({ children, startIcon, endIcon, component: Component = 'button', to, fullWidth, variant, ...props }, ref) =>
      React.createElement(
        Component,
        {
          ...props,
          ref,
          ...(to ? { to } : {}),
          ...(fullWidth ? { 'data-fullwidth': 'true' } : {}),
          ...(variant ? { 'data-variant': variant } : {}),
        },
        startIcon,
        children,
        endIcon,
      ),
    ),
    ButtonGroup,
    Chip: createStub('span'),
    Divider: createStub('hr'),
    TextField,
    MenuItem,
    Alert,
    LinearProgress: createStub('div'),
    Skeleton: createStub('div'),
    Tab,
    Tabs,
    Table: createStub('table'),
    TableBody: createStub('tbody'),
    TableCell: createStub('td'),
    TableHead: createStub('thead'),
    TableRow: createStub('tr'),
    Stack,
    AppBar: createStub('header'),
    Toolbar: createStub('div'),
    Drawer: createStub('aside'),
    IconButton: React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
      ({ children, ...props }, ref) => React.createElement('button', { ...props, ref }, children),
    ),
    List: createStub('ul'),
    ListItemButton: React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>(
      ({ children, ...props }, ref) => React.createElement('button', { ...props, ref }, children),
    ),
    ListItemIcon: createStub('span'),
    Tooltip: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    ToggleButton,
    ToggleButtonGroup,
    useMediaQuery,
  }
})
