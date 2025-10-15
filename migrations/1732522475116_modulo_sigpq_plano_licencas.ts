import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_plano_licencas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome').notNullable()
      table.boolean('activo').defaultTo(true)
      table.boolean('eliminado').defaultTo(false)
      table.dateTime('dia_inicio').notNullable()
      table.dateTime('dia_fim').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('updated_by').unsigned().references('id').inTable('users').nullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.string('descricao').nullable().defaultTo('criado automaticamente pelo sistema')
      table.integer('tipo_licenca_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipos_licencas')
        .onDelete('RESTRICT')
      table.enum('situacao', ['aberto', 'fechado'])
        .nullable()
        .defaultTo('aberto')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
