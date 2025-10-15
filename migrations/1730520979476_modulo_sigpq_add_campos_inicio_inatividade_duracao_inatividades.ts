import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_estados'

  public async up () {
    this.schema.alterTable('sigpq_funcionario_estados', (table) => {
      table.dateTime('data_inicio_inatividade').nullable()
      table.integer('duracao_inatividade').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('data_inicio_inatividade')
      table.dropColumn('duracao_inatividade')
    })
  }
}
