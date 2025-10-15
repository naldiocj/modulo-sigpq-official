import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_orgaos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('numero_ordem').nullable().after('user_id')
      table.string('anexo_guia').nullable().after('user_id')
      table.string('anexo_ordem').nullable().after('user_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('numero_ordem', 'anexo_guia', 'anexo_ordem');
    })
  }
}
