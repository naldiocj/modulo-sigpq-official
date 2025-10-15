import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_provimentos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('numero_ordem').nullable().after('user_id')
      table.enum('situacao', ['actual', 'anterior']).defaultTo('actual')
    })
  }


}
