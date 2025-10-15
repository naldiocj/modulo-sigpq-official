import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tratamento_correspondencias'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('estado', ['S', 'D', 'P', 'E', 'PR', 'PA']).defaultTo('P').comment('S - Saído, D-Despacho, P-Pendente, E - Expedido, PR - Pronunciamento, PA - Parecer')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('estado')
    })
  }
}
