import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tipo_cursos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('tipo', ['Formação Técnico Policial','Formação Acadêmica','Outras Formações']).defaultTo('Formação Acadêmica')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tipo')
    })
  }
}
