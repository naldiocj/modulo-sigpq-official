import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionarios'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.integer('sigpq_tipo_sanguineo_id')
        .after('pseudonimo')
        .defaultTo(1)
        .unsigned()
        .references('sigpq_tipo_sanguineos.id')
        .notNullable()

    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('sigpq_tipo_sanguineo_id')
    })
  }
}
