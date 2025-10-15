import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_documentos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      // remove sigpq_tipo_documento e adiciona sigpq_tipo_documento_id
      table.dropForeign('sigpq_tipo_documento');
      table.dropColumn('sigpq_tipo_documento');
      table.integer('sigpq_tipo_documento_id').after('activo')
        .unsigned().references('sigpq_tipo_documentos.id').notNullable()

      // remove pessoajuridica e adiciona pessoafisica
      table.dropForeign('pessoajuridica_id');
      table.dropColumn('pessoajuridica_id');
      table.integer('pessoafisica_id').after('data_expira')
        .unsigned().references('pessoas.id').notNullable()

      // remove ndi e adiciona nid
      table.dropColumn('ndi');
      table.string('nid').after('id').notNullable()

    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('sigpq_tipo_documento_id')
      table.dropColumn('ndi');
    })
  }
}
