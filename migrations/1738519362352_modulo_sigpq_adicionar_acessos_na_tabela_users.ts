import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('aceder_departamento').nullable().defaultTo(false)
      table.boolean('aceder_seccao').nullable().defaultTo(false)
      table.boolean('aceder_posto_policial').nullable().defaultTo(false)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('aceder_departamento')
      table.dropColumn('aceder_seccao')
      table.dropColumn('aceder_posto_policial')
    })
  }
}
