import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoajuridicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('eliminado').defaultTo(false).after('tipo_pessoajuridica_id')
      table.integer('user_id').unsigned().references('id').inTable('users').after('tipo_pessoajuridica_id')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('eliminado')
      table.dropForeign('user_id')
    })
  }
}
