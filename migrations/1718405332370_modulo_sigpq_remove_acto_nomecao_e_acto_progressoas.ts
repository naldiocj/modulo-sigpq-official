import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcaos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sigpq_acto_nomeacao_id')
      table.dropForeign('acto_progressao_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('sigpq_acto_nomeacao_id').unsigned().references('id').inTable('sigpq_acto_nomeacaos').after('user_id');
      table.integer('acto_progressao_id').unsigned().references('id').inTable('sigpq_acto_progressaos').after('user_id');
    })
  }
}

