import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_provimentos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pessoa_id')
        .unsigned()
        .references('id')
        .inTable('pessoas')
        .onDelete('RESTRICT')
      table.integer('patente_id')
        .unsigned()
        .references('id')
        .inTable('patentes')
        .onDelete('RESTRICT')
      table.integer('numero_despacho').nullable()
      table.date('data_provimento').nullable()
      table.integer('acto_progressao_id')
        .nullable()
        .unsigned()
        .references('id')
        .inTable('sigpq_acto_progressaos')
        .onDelete('RESTRICT').notNullable()
      table.text('anexo').nullable()
      table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.boolean('activo').defaultTo(true)
      table.string('descricao').nullable()
      table.boolean('eliminado').defaultTo(false)

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
