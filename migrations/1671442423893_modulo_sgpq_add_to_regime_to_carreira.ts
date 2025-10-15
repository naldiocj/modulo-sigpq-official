import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tipo_carreiras'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.integer('regime_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('regimes')
        .after('sigla')
        .defaultTo(2);

      table.integer('ordem')
        .after('sigla')
        .nullable()

    })
  }

  public async down() {
  }
}
