import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tratamento_correspondencias'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('estado')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('estado',['N', 'D', 'P',]).defaultTo('N')
    })
  }
}
