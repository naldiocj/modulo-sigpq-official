import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'regimes'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('quadro')
        .notNullable()
        .after('sigla')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('quadro')
    })
  }
}
