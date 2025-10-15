import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_orgaos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ordem_data')
      table.dropColumn('numero_ordem')
      table.dropColumn('ordem_descricao')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('ordem_data')
      table.string('numero_ordem')
      table.string('ordem_descricao')
    })
  }
}
