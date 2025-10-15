import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'role_permissions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users').after('permission_id')
      table.boolean('eliminado').defaultTo(false).after('permission_id')
      table.boolean('activo').defaultTo(true).after('permission_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('user_id')
      table.dropColumns('eliminado', 'activo')
    })
  }
}
