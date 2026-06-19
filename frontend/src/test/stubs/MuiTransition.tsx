type TransitionProps = {
  children: ((state: string, childProps: Record<string, unknown>) => React.ReactNode) | React.ReactNode
}

export default function MuiTransition({ children }: TransitionProps) {
  return typeof children === 'function' ? children('entered', {}) : children
}
