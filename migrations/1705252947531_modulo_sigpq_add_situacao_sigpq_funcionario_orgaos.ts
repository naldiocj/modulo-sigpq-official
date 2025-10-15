import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_orgaos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('situacao', ['actual','anterior']).defaultTo('actual').after('user_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('situacao')
    })
  }
}
