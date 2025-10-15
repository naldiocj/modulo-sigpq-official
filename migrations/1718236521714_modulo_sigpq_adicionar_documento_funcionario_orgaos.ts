import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_orgaos'

 
  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('anexo_ordem')
      table.dropColumn('anexo_guia')
      table.integer('sigpq_documento_anexo_id').unsigned().references('id').inTable('sigpq_documentos')
      table.integer('sigpq_documento_guia_id').unsigned().references('id').inTable('sigpq_documentos')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('anexo_ordem')
      table.string('anexo_guia')
      table.dropForeign('sigpq_documento_id')
    })
  }
}
