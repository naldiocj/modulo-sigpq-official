import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_cursos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('instituicao_de_ensino_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('sigpq_instituicao_de_ensino')
        .onDelete('RESTRICT')
        table.integer('ano_de_conclusao_do_curso').nullable().defaultTo(null)
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns("instituicao_de_ensino_id","ano_de_conclusao_do_curso");
    });
  }
}
