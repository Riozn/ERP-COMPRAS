import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MigrationInterface, QueryRunner } from 'typeorm'

const filename = fileURLToPath(import.meta.url)
const directory = dirname(filename)
const schemaPath = resolve(directory, '../../../../../../docker/postgres/init.sql')

function readStatements(): string[] {
  const sql = readFileSync(schemaPath, 'utf8')
  return sql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
}

export class CoreSchema1700000000000 implements MigrationInterface {
  name = 'CoreSchema1700000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const statement of readStatements()) {
      await queryRunner.query(statement)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'auditoria_eventos',
      'cxp_pagos_proveedor',
      'cxp_cuentas_por_pagar',
      'diario_inventario',
      'compras_detalle',
      'compras_encabezado',
      'o_articulo_almacen',
      'o_articulos',
      'o_proveedores',
      'o_tipos_documento',
      'o_estados_documento',
      'o_grupos_articulo',
      'o_impuestos',
      'o_almacenes',
      'o_monedas',
      'auth_2fa_codes',
      'auth_refresh_tokens',
      'o_usuarios',
      'o_roles',
    ]

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`)
    }

    await queryRunner.query('DROP EXTENSION IF EXISTS pgcrypto')
  }
}
