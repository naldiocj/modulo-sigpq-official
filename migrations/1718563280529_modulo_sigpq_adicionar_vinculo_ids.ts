import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tipo_vinculos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('sigpq_vinculo_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sigpq_vinculo_id')
    })
  }
}
