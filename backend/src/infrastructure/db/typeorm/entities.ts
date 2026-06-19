import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'o_roles' })
export class RoleEntity {
  @PrimaryColumn({ type: 'integer' })
  id!: number

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo!: string

  @Column({ type: 'varchar', length: 100 })
  nombre!: string
}

@Entity({ name: 'o_usuarios' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string

  @Column({ name: 'nombre_completo', type: 'varchar', length: 150 })
  nombreCompleto!: string

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono!: string | null

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string

  @Column({ name: 'google_sub', type: 'varchar', length: 255, nullable: true })
  googleSub!: string | null

  @Column({ name: 'rol_id', type: 'integer' })
  rolId!: number

  @Column({ type: 'boolean', default: true })
  activo!: boolean

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled!: boolean

  @Column({ name: 'two_factor_secret', type: 'varchar', length: 255, nullable: true })
  twoFactorSecret!: string | null

  @Column({ name: 'ultimo_login', type: 'timestamp', nullable: true })
  ultimoLogin!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date
}

@Entity({ name: 'auth_refresh_tokens' })
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string

  @Column({ name: 'token_hash', type: 'text' })
  tokenHash!: string

  @CreateDateColumn({ name: 'issued_at', type: 'timestamp' })
  issuedAt!: Date

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt!: Date | null

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent!: string | null

  @Column({ name: 'ip_origen', type: 'varchar', length: 50, nullable: true })
  ipOrigen!: string | null
}

@Entity({ name: 'auth_2fa_codes' })
export class TwoFactorCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string

  @Column({ name: 'codigo_hash', type: 'varchar', length: 255 })
  codigoHash!: string

  @Column({ type: 'varchar', length: 20 })
  canal!: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VOICE' | 'APP'

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date

  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt!: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}

@Entity({ name: 'o_monedas' })
export class CurrencyEntity {
  @PrimaryColumn({ type: 'integer' })
  id!: number

  @Column({ type: 'varchar', length: 3, unique: true })
  codigo!: string

  @Column({ type: 'varchar', length: 100 })
  nombre!: string

  @Column({ name: 'tasa_actual', type: 'numeric', precision: 10, scale: 4, default: 1 })
  tasaActual!: string
}

@Entity({ name: 'o_almacenes' })
export class WarehouseEntity {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id!: string

  @Column({ type: 'varchar', length: 100 })
  nombre!: string

  @Column({ type: 'text', nullable: true })
  ubicacion!: string | null

  @Column({ type: 'boolean', default: true })
  activo!: boolean
}

@Entity({ name: 'o_impuestos' })
export class TaxEntity {
  @PrimaryColumn({ type: 'integer' })
  id!: number

  @Column({ name: 'tax_code', type: 'varchar', length: 10, unique: true })
  taxCode!: string

  @Column({ type: 'varchar', length: 100 })
  nombre!: string

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 0 })
  porcentaje!: string

  @Column({ type: 'boolean', default: true })
  activo!: boolean
}

@Entity({ name: 'o_grupos_articulo' })
export class ItemGroupEntity {
  @PrimaryColumn({ type: 'integer' })
  id!: number

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo!: string

  @Column({ type: 'varchar', length: 100 })
  nombre!: string
}

@Entity({ name: 'o_estados_documento' })
export class DocumentStateEntity {
  @PrimaryColumn({ type: 'integer' })
  id!: number

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo!: string

  @Column({ type: 'varchar', length: 100 })
  nombre!: string
}

@Entity({ name: 'o_tipos_documento' })
export class DocumentTypeEntity {
  @PrimaryColumn({ type: 'integer' })
  id!: number

  @Column({ type: 'varchar', length: 5, unique: true })
  codigo!: string

  @Column({ type: 'varchar', length: 100 })
  nombre!: string

  @Column({ name: 'afecta_inventario', type: 'boolean', default: false })
  afectaInventario!: boolean
}

@Entity({ name: 'o_proveedores' })
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'card_code', type: 'varchar', length: 20, unique: true })
  cardCode!: string

  @Column({ name: 'card_name', type: 'varchar', length: 150 })
  cardName!: string

  @Column({ name: 'nombre_comercial', type: 'varchar', length: 150, nullable: true })
  nombreComercial!: string | null

  @Column({ name: 'nit_rut', type: 'varchar', length: 50 })
  nitRut!: string

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono!: string | null

  @Column({ type: 'text', nullable: true })
  direccion!: string | null

  @Column({ name: 'moneda_id', type: 'integer' })
  monedaId!: number

  @Column({ name: 'balance_cuenta', type: 'numeric', precision: 18, scale: 2, default: 0 })
  balanceCuenta!: string

  @Column({ name: 'linea_credito', type: 'numeric', precision: 18, scale: 2, default: 0 })
  lineaCredito!: string

  @Column({ type: 'boolean', default: true })
  activo!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date
}

@Entity({ name: 'o_articulos' })
export class ItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'item_code', type: 'varchar', length: 50, unique: true })
  itemCode!: string

  @Column({ name: 'item_name', type: 'varchar', length: 150 })
  itemName!: string

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null

  @Column({ name: 'unidad_medida', type: 'varchar', length: 20, default: 'UNI' })
  unidadMedida!: string

  @Column({ name: 'costo_estandar', type: 'numeric', precision: 18, scale: 4, default: 0 })
  costoEstandar!: string

  @Column({ name: 'grupo_id', type: 'integer' })
  grupoId!: number

  @Column({ name: 'impuesto_id', type: 'integer' })
  impuestoId!: number

  @Column({ type: 'boolean', default: true })
  activo!: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date
}

@Entity({ name: 'o_articulo_almacen' })
export class ItemWarehouseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'articulo_id', type: 'uuid' })
  articuloId!: string

  @Column({ name: 'almacen_id', type: 'varchar', length: 20 })
  almacenId!: string

  @Column({ name: 'stock_fisico', type: 'numeric', precision: 18, scale: 4, default: 0 })
  stockFisico!: string

  @Column({ name: 'comprometido', type: 'numeric', precision: 18, scale: 4, default: 0 })
  comprometido!: string

  @Column({ name: 'solicitado', type: 'numeric', precision: 18, scale: 4, default: 0 })
  solicitado!: string

  @Column({ name: 'stock_disponible', type: 'numeric', precision: 18, scale: 4, default: 0 })
  stockDisponible!: string
}

@Entity({ name: 'compras_encabezado' })
export class PurchaseHeaderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'tipo_doc_id', type: 'integer' })
  tipoDocId!: number

  @Column({ name: 'doc_num', type: 'integer' })
  docNum!: number

  @Column({ name: 'proveedor_id', type: 'uuid', nullable: true })
  proveedorId!: string | null

  @Column({ name: 'estado_id', type: 'integer' })
  estadoId!: number

  @Column({ name: 'moneda_id', type: 'integer' })
  monedaId!: number

  @Column({ name: 'fecha_documento', type: 'date' })
  fechaDocumento!: string

  @Column({ name: 'fecha_contabilizacion', type: 'timestamp', default: () => 'NOW()' })
  fechaContabilizacion!: Date

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento!: string | null

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  subtotal!: string

  @Column({ name: 'descuento_total', type: 'numeric', precision: 18, scale: 2, default: 0 })
  descuentoTotal!: string

  @Column({ name: 'impuestos_total', type: 'numeric', precision: 18, scale: 2, default: 0 })
  impuestosTotal!: string

  @Column({ name: 'total_documento', type: 'numeric', precision: 18, scale: 2, default: 0 })
  totalDocumento!: string

  @Column({ type: 'text', nullable: true })
  comentarios!: string | null

  @Column({ name: 'is_canceled', type: 'boolean', default: false })
  isCanceled!: boolean

  @Column({ name: 'doc_cancelado_id', type: 'uuid', nullable: true })
  docCanceladoId!: string | null

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date
}

@Entity({ name: 'compras_detalle' })
export class PurchaseLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'doc_id', type: 'uuid' })
  docId!: string

  @Column({ name: 'line_num', type: 'integer' })
  lineNum!: number

  @Column({ name: 'articulo_id', type: 'uuid' })
  articuloId!: string

  @Column({ name: 'almacen_id', type: 'varchar', length: 20 })
  almacenId!: string

  @Column({ name: 'impuesto_id', type: 'integer' })
  impuestoId!: number

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null

  @Column({ name: 'cantidad_total', type: 'numeric', precision: 18, scale: 4, default: 0 })
  cantidadTotal!: string

  @Column({ name: 'cantidad_pendiente', type: 'numeric', precision: 18, scale: 4, default: 0 })
  cantidadPendiente!: string

  @Column({ name: 'precio_unitario', type: 'numeric', precision: 18, scale: 4, default: 0 })
  precioUnitario!: string

  @Column({ name: 'descuento_linea', type: 'numeric', precision: 18, scale: 2, default: 0 })
  descuentoLinea!: string

  @Column({ name: 'subtotal_linea', type: 'numeric', precision: 18, scale: 2, default: 0 })
  subtotalLinea!: string

  @Column({ name: 'total_linea', type: 'numeric', precision: 18, scale: 2, default: 0 })
  totalLinea!: string

  @Column({ name: 'base_tipo_doc_id', type: 'integer', nullable: true })
  baseTipoDocId!: number | null

  @Column({ name: 'base_entry', type: 'uuid', nullable: true })
  baseEntry!: string | null

  @Column({ name: 'base_line', type: 'integer', nullable: true })
  baseLine!: number | null
}

@Entity({ name: 'diario_inventario' })
export class InventoryLedgerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'articulo_id', type: 'uuid' })
  articuloId!: string

  @Column({ name: 'almacen_id', type: 'varchar', length: 20 })
  almacenId!: string

  @Column({ name: 'doc_referencia_id', type: 'uuid' })
  docReferenciaId!: string

  @Column({ name: 'tipo_movimiento', type: 'varchar', length: 3 })
  tipoMovimiento!: 'IN' | 'OUT'

  @Column({ type: 'numeric', precision: 18, scale: 4 })
  cantidad!: string

  @Column({ name: 'costo_momento', type: 'numeric', precision: 18, scale: 4, default: 0 })
  costoMomento!: string

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string

  @Column({ type: 'timestamp', default: () => 'NOW()' })
  fecha!: Date

  @Column({ type: 'text', nullable: true })
  comentario!: string | null
}

@Entity({ name: 'cxp_cuentas_por_pagar' })
export class PayableAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'compra_id', type: 'uuid' })
  compraId!: string

  @Column({ name: 'proveedor_id', type: 'uuid' })
  proveedorId!: string

  @Column({ name: 'numero_factura', type: 'varchar', length: 50 })
  numeroFactura!: string

  @Column({ name: 'monto_total', type: 'numeric', precision: 18, scale: 2, default: 0 })
  montoTotal!: string

  @Column({ name: 'saldo_pendiente', type: 'numeric', precision: 18, scale: 2, default: 0 })
  saldoPendiente!: string

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento!: string

  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado!: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'ANULADA'

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date
}

@Entity({ name: 'cxp_pagos_proveedor' })
export class PayablePaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'cuenta_por_pagar_id', type: 'uuid' })
  cuentaPorPagarId!: string

  @Column({ name: 'proveedor_id', type: 'uuid' })
  proveedorId!: string

  @Column({ type: 'numeric', precision: 18, scale: 2 })
  monto!: string

  @Column({ name: 'fecha_pago', type: 'timestamp' })
  fechaPago!: Date

  @Column({ type: 'varchar', length: 100, nullable: true })
  referencia!: string | null

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date
}

@Entity({ name: 'auditoria_eventos' })
export class AuditEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string

  @Column({ type: 'varchar', length: 50 })
  entidad!: string

  @Column({ name: 'entidad_id', type: 'uuid', nullable: true })
  entidadId!: string | null

  @Column({ type: 'varchar', length: 30 })
  accion!: string

  @Column({ name: 'datos_antes', type: 'text', nullable: true })
  datosAntes!: string | null

  @Column({ name: 'datos_despues', type: 'text', nullable: true })
  datosDespues!: string | null

  @Column({ name: 'ip_origen', type: 'varchar', length: 50, nullable: true })
  ipOrigen!: string | null

  @CreateDateColumn({ name: 'fecha', type: 'timestamp' })
  fecha!: Date
}
