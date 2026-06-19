import type { MigrationInterface, QueryRunner } from 'typeorm'

export class UserPhone1700000001000 implements MigrationInterface {
  name = 'UserPhone1700000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE o_usuarios
      ADD COLUMN IF NOT EXISTS telefono VARCHAR(30)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE o_usuarios
      DROP COLUMN IF EXISTS telefono
    `)
  }
}
