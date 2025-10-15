import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_familiars'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dateTime('data_de_nascimento', { useTz: true }).nullable().defaultTo(null)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('data_de_nascimento')
    })
  }
}
