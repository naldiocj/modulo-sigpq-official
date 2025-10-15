import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_estados'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('sigpq_estado_reforma_id').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sigpq_estado_reforma_id')
    })
  }
}
