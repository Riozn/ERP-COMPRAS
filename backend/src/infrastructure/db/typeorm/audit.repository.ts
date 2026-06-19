import { DataSource } from 'typeorm'

import type { AuditRepository, AuditEventInput } from '../../../domain/repositories/audit.repository.js'
import { AuditEventEntity } from './entities.js'

export class TypeormAuditRepository implements AuditRepository {
  constructor(private readonly dataSource: DataSource) {}

  async record(event: AuditEventInput): Promise<void> {
    await this.dataSource.getRepository(AuditEventEntity).save(
      this.dataSource.getRepository(AuditEventEntity).create({
        usuarioId: event.usuarioId,
        entidad: event.entidad,
        entidadId: event.entidadId ?? null,
        accion: event.accion,
        datosAntes: event.datosAntes ?? null,
        datosDespues: event.datosDespues ?? null,
        ipOrigen: event.ipOrigen ?? null,
      }),
    )
  }
}
