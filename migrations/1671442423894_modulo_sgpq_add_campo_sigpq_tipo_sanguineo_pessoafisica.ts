import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoafisicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.integer('sigpq_tipo_sanguineo_id')
        .unsigned()
        .nullable()
        .references('sigpq_tipo_sanguineos.id')
        .after('iban')

    })
  }

  public async down() {
  }
}
