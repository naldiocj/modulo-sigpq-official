import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_vaga_em_promocao_por_orgaos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.boolean('activo').defaultTo(true)
      table.boolean('eliminado').defaultTo(false)

      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('quantidade').unsigned().defaultTo(0)
      table.integer('updated_by').unsigned().references('id').inTable('users').nullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.integer('patentes_id')
        .unsigned()
        .references('id')
        .inTable('patentes')
        .onDelete('RESTRICT').nullable()

        table.integer('tipo_carreiras_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipo_carreiras')
        .onDelete('RESTRICT').nullable()

        table.integer('pessoajuridica_id')
        .references('id')
        .inTable('pessoajuridicas')
        .onDelete('RESTRICT')

        table.enum('situacao', ['aberto', 'fechado'])
        .nullable()
        .defaultTo('aberto')

      table.timestamp('data_inicio', { useTz: true })
      table.timestamp('data_fim', { useTz: true })

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
