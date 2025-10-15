import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_provimentos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('despacho_descricao').nullable().after('user_id')
      table.string('ordem_descricao').nullable().after('user_id')
      table.string('despacho_data').nullable().after('user_id')
      table.string('ordem_data').nullable().after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('despacho_descricao')
      table.dropColumn('ordem_descricao')
      table.dropColumn('despacho_data')
      table.dropColumn('ordem_data')
    })
  }
}
