import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoajuridicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('tipo_estrutura_organica_sigla').defaultTo(null)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tipo_estrutura_organica_sigla')
    })
  }
}
