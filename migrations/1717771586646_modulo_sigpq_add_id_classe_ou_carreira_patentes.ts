import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patentes'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('sigpq_tipo_carreira_id').unsigned().references('id').inTable('sigpq_tipo_carreiras').after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('sigpq_tipo_carreiras')
    })
  }
}
