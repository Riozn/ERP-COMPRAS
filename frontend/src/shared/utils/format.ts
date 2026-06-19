export function formatCurrency(value: number | string, currency = 'USD'): string {
  const amount = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(amount)) {
    return '$0.00'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(value: number | string, digits = 0): string {
  const amount = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(amount)) {
    return '0'
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
}

export function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
