import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_instituicao_de_ensino'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome')
      table.string('sigla').notNullable()
      table.text('descricao').nullable().defaultTo('criado automaticamente pelo sistema')

      table.integer('tipo_formacao_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipo_formacao')
        .onDelete('RESTRICT')

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
