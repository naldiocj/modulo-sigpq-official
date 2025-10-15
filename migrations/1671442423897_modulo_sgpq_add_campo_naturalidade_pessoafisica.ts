import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoafisicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.integer('naturalidade_id')
        .unsigned()
        .nullable()
        .references('provincias.id')
        .after('iban')

    })
  }

  public async down() {
  }
}
