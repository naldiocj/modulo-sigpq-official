import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_habilitacaoliterarias'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.integer('sigpq_tipo_habilitacaoliteraria_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('sigpq_tipo_habilitacaoliterarias.id')
      table.dropForeign('sigpq_tipo_ausencia_id');

    })
  }

  public async down() {
  }
}
