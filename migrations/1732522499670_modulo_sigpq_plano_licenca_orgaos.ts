import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_plano_licenca_orgaos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.boolean('activo').defaultTo(true)
      table.boolean('eliminado').defaultTo(false)

      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('updated_by').unsigned().references('id').inTable('users').nullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.integer('plano_licencas_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_plano_licencas')
        .onDelete('RESTRICT')

        table.integer('pessoajuridica_id')
        .references('id')
        .inTable('pessoajuridicas')
        .onDelete('RESTRICT')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
