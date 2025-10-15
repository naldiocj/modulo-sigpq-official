import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_correspondencias'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('importancia_id').unsigned().references('id').inTable('tipo_importancias').after('user_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('tipo_importancia_id')
    })
  }
}
