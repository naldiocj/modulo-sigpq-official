import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_orgaos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('pessoajuridica_passado_id').nullable()
    
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('pessoajuridica_passado_id')
    })
  }
}
