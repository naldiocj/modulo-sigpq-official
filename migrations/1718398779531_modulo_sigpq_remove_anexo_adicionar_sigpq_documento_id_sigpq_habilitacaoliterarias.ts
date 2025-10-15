import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_habilitacaoliterarias'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('anexo')
      table.integer('sigpq_documento_id').unsigned().references('id').inTable('sigpq_documentos').after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('sigpq_documento_id')
      table.string('anexo')
    })
  }
}
