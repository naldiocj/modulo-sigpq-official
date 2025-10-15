import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tipo_vinculos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('regime', ['Geral', 'Especial']).defaultTo('Geral')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('regime')
    })
  }
}
