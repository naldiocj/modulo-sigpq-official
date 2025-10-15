import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_estados'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('sigpq_situacao_id').unsigned().references('id').inTable('sigpq_situacao_estados')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('sigpq_situacao_id')
    })
  }
}
