import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('aceder_todos_agentes').defaultTo(false).after('username')
      table.boolean('aceder_painel_piips').defaultTo(false).after('username')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('aceder_todos_agentes','aceder_painel_piips')
    })
  }
}
