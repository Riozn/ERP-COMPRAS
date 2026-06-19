export type AuditEventInput = {
  usuarioId: string
  entidad: string
  entidadId?: string | null
  accion: string
  datosAntes?: string | null
  datosDespues?: string | null
  ipOrigen?: string | null
}

export interface AuditRepository {
  record(event: AuditEventInput): Promise<void>
}
