import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tipo_cursos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('tipo_formacao_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('sigpq_tipo_formacao')
        .onDelete('RESTRICT')
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns("tipo_formacao_id");
    });
  }
}
