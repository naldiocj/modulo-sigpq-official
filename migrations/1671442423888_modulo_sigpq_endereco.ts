import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_enderecos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('residencia_actual')
      table.integer('pessoa_id')
        .unsigned()
        .references('pessoas.id')
        .onDelete('RESTRICT')
      table.integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('RESTRICT')
      table.boolean('activo').defaultTo(true)
      table.text('observacao').nullable()
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
