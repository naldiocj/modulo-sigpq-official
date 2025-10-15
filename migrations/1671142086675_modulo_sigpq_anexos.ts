import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_anexos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('anexo').notNullable()
      table.integer('pessoajuridica_id')
        .unsigned()
        .references('id')
        .inTable('pessoas')
        .onDelete('RESTRICT')
      table.integer('sigpq_tipo_anexo_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipo_anexos')
        .onDelete('RESTRICT')
      table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.boolean('activo').defaultTo(true)
      table.string('descricao').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
