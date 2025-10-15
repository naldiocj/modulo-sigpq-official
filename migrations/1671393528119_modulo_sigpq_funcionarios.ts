import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionarios'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nip').unique().nullable()
      table.string('numero_processo').unique().nullable()
      table.string('numero_agente').unique().nullable()

      table.string('pseudonimo').nullable()
      table.integer('sigpq_tipo_vinculo_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipo_vinculos')
        .onDelete('RESTRICT')

      table.date('data_adesao').notNullable()
      table.string('foto_efectivo').nullable()
      table.text('descricao').nullable()
      table.text('anexo_processo').nullable()

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
