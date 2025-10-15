import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tipos_licencas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome')
      table.string('sigla').notNullable()
      table.text('descricao').nullable().defaultTo('criado automaticamente pelo sistema')
      table.integer('dias_maximos').nullable()
      table.integer('limite_anual').nullable().defaultTo(1)
      table.boolean('exige_anexo').nullable().defaultTo(false)
      table.boolean('activo').defaultTo(true)
      table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.boolean('eliminado').defaultTo(false)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
