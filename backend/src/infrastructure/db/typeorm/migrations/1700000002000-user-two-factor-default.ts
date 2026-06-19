import type { MigrationInterface, QueryRunner } from 'typeorm'

export class UserTwoFactorDefault1700000002000 implements MigrationInterface {
  name = 'UserTwoFactorDefault1700000002000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE o_usuarios
      SET two_factor_enabled = TRUE
      WHERE two_factor_enabled = FALSE
    `)

    await queryRunner.query(`
      ALTER TABLE o_usuarios
      ALTER COLUMN two_factor_enabled SET DEFAULT TRUE
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE o_usuarios
      ALTER COLUMN two_factor_enabled SET DEFAULT FALSE
    `)

    await queryRunner.query(`
      UPDATE o_usuarios
      SET two_factor_enabled = FALSE
      WHERE two_factor_enabled = TRUE
    `)
  }
}
