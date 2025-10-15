import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_agente_em_excepcaos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('observacao', 'long').nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('observacao')
    })
  }
}
