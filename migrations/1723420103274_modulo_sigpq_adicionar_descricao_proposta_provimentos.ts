import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_proposta_provimentos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('descricao').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('descricao')
    })
  }
}
