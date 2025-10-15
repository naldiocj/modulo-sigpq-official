import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tipo_cargos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.integer('ordem')
        .unsigned()
        .nullable()
        .after('sigla')
    })
  }

  public async down() {
  }
}
