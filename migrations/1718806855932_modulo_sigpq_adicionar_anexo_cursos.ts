import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_cursos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('anexo').nullable().after('user_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('anexo')
    })
  }
}
