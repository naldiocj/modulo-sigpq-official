import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_vinculos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.boolean('activo').defaultTo(true)
      table.integer('pessoafisica_id')
        .unsigned()
        .references('id')
        .inTable('pessoas')
        .onDelete('RESTRICT')
      table.integer('sigpq_tipo_vinculo_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipo_vinculos')
        .onDelete('RESTRICT')
      table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
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
