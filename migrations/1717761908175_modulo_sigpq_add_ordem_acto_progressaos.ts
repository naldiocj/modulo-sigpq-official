import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_acto_progressaos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('ordem').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('ordem')
    })
  }
}
