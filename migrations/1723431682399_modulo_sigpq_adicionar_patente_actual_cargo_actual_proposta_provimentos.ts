import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_proposta_provimentos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('patente_id_actual').unsigned().references('id').inTable('patentes')
      table.integer('sigpq_tipo_cargo_id_actual').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sigpq_tipo_cargo_id_actual')
      table.dropForeign('patenete_id_actual')
    })
  }
}
