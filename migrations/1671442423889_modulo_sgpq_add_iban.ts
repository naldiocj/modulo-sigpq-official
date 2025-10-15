import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoafisicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.bigInteger('iban')
        .after('estado')
        .unsigned()
        .nullable()

    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('iban');
    })
  }
}
