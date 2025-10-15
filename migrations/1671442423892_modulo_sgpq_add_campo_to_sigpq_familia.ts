import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_familiars'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.integer('sigpq_tipo_documento_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('sigpq_tipo_documentos')
        .after('sigpq_tipo_familiar_id')
      table.text('anexo').nullable()
        .after('user_id')
      table.dropForeign('sigpq_tipo_ausencia_id');

    })
  }

  public async down() {
  }
}
