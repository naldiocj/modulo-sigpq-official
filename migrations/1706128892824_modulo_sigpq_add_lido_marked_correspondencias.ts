import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_orgao_correspondencias'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('n_lido').defaultTo(true)
      table.boolean('marcado').defaultTo(true)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('n_lido')
      table.dropColumn('marcado')
    })
  }
}
