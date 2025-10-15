import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_chefias'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('sigpq_tipo_chefia_comando_id').unsigned()
        .references('id')
        .inTable('sigpq_tipo_chefia_comandos')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('sigpq_tipo_chefia_comando_id')
    })
  }
}
