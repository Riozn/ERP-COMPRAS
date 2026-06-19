import type {
  CompletePurchaseInput,
  CompletePurchaseResult,
  PreparedCompletePurchaseInput,
  PurchaseWorkflowLineInput,
} from '../../domain/operations/purchase-workflow.types.js'
import type { PurchaseWorkflowRepository } from '../../domain/repositories/purchase-workflow.repository.js'
import { ValidationError } from '../../shared/errors/http-error.js'

function readDecimal(value: string, field: string): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new ValidationError(`${field} debe ser numerico.`)
  }

  return parsed
}

function formatAmount(value: number): string {
  return value.toFixed(2)
}

function formatQuantity(value: number): string {
  return value.toFixed(4)
}

function normalizeText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function prepareLine(
  line: PurchaseWorkflowLineInput,
  lineNum: number,
): {
  subtotal: number
  total: number
  descuento: number
  prepared: PreparedCompletePurchaseInput['lines'][number]
  inventoryCost: string
} {
  const cantidad = readDecimal(line.cantidadTotal, 'cantidadTotal')
  if (cantidad <= 0) {
    throw new ValidationError('cantidadTotal debe ser mayor a cero.')
  }

  const precioUnitario = readDecimal(line.precioUnitario, 'precioUnitario')
  const descuento = line.descuentoLinea ? readDecimal(line.descuentoLinea, 'descuentoLinea') : 0

  const subtotal = line.subtotalLinea ? readDecimal(line.subtotalLinea, 'subtotalLinea') : cantidad * precioUnitario
  const total = line.totalLinea ? readDecimal(line.totalLinea, 'totalLinea') : Math.max(subtotal - descuento, 0)

  if (subtotal < 0 || total < 0) {
    throw new ValidationError('Los importes de la linea no pueden ser negativos.')
  }

  return {
    subtotal,
    total,
    descuento,
    prepared: {
      lineNum,
      docId: '',
      articuloId: line.articuloId,
      almacenId: line.almacenId,
      impuestoId: line.impuestoId,
      descripcion: normalizeText(line.descripcion) ?? null,
      cantidadTotal: formatQuantity(cantidad),
      cantidadPendiente: formatQuantity(cantidad),
      precioUnitario: formatAmount(precioUnitario),
      descuentoLinea: formatAmount(descuento),
      subtotalLinea: formatAmount(subtotal),
      totalLinea: formatAmount(total),
      baseTipoDocId: line.baseTipoDocId ?? null,
      baseEntry: line.baseEntry ?? null,
      baseLine: line.baseLine ?? null,
    },
    inventoryCost: quantityCost(cantidad, total),
  }
}

function quantityCost(quantity: number, total: number): string {
  if (quantity <= 0) {
    return formatAmount(total)
  }

  return formatAmount(total / quantity)
}

export class PurchaseWorkflowApplicationService {
  constructor(private readonly repository: PurchaseWorkflowRepository) {}

  async completePurchase(input: CompletePurchaseInput): Promise<CompletePurchaseResult> {
    if (!input.lines.length) {
      throw new ValidationError('La compra debe incluir al menos una linea.')
    }

    const registrarInventario = input.registrarInventario ?? true
    const registrarCuentaPorPagar = input.registrarCuentaPorPagar ?? true
    const fechaContabilizacion = new Date().toISOString()
    const numeroFactura = (input.numeroFactura ?? `${input.tipoDocId}-${input.docNum}`).trim()

    if (!input.proveedorId.trim()) {
      throw new ValidationError('proveedorId es obligatorio.')
    }

    const preparedLines = input.lines.map((line, index) => prepareLine(line, index + 1))
    const subtotal = preparedLines.reduce((total, line) => total + line.subtotal, 0)
    const descuentoTotal = preparedLines.reduce((total, line) => total + line.descuento, 0)
    const totalDocumento = preparedLines.reduce((total, line) => total + line.total, 0)
    const impuestosTotal = Math.max(totalDocumento - subtotal, 0)

    const preparedInput: PreparedCompletePurchaseInput = {
      createdBy: input.createdBy,
      tipoDocId: input.tipoDocId,
      docNum: input.docNum,
      proveedorId: input.proveedorId,
      estadoId: input.estadoId,
      monedaId: input.monedaId,
      fechaDocumento: input.fechaDocumento,
      fechaContabilizacion,
      fechaVencimiento: input.fechaVencimiento ?? null,
      subtotal: formatAmount(subtotal),
      descuentoTotal: formatAmount(descuentoTotal),
      impuestosTotal: formatAmount(impuestosTotal),
      totalDocumento: formatAmount(totalDocumento),
      comentarios: normalizeText(input.comentarios) ?? null,
      approvedBy: normalizeText(input.approvedBy) ?? null,
      numeroFactura,
      registrarInventario,
      registrarCuentaPorPagar,
      lines: preparedLines.map((line) => line.prepared),
    }

    return this.repository.completePurchase(preparedInput)
  }
}
