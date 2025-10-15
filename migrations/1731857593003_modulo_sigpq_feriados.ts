import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'modulo_sigpq_feriados'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome')
      table.text('descricao').nullable().defaultTo('criado automaticamente pelo sistema')
      table.text('observacoes').nullable() // Observações adicionais
      table.dateTime('dia_selecionado').notNullable()
      table.boolean('licenca_aplicada').defaultTo(true) // Se a licença foi aplicada automaticamente
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
