import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_provimentos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('anexo')
      table.integer('sigpq_documento_id').unsigned().references('id').inTable('sigpq_documentos')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('anexo')
      table.dropForeign('sigpq_documento_id')
    })
  }
}
