import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcaos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('anexo')
      table.dropColumn('numero_ordem')
      table.dropColumn('numero_despacho')
      table.dropColumn('data')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('anexo')
      table.string('numero_ordem')
      table.string('numero_despacho')
      table.date('date')
    })
  }
}
