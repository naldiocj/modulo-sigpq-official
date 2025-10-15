import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_orgaos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('data_ingresso').nullable().after('user_id')
      table.string('numero_guia').nullable().after('user_id')
      table.string('despacho').nullable().after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('despacho','data_ingresso','numero_guia')
    })
  }
}
