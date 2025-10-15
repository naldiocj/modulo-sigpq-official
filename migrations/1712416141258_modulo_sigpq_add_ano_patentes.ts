import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patentes'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('duracao').nullable().after('user_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('duracao')
    })
  }
}
