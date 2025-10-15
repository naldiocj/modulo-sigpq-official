import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcaos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.string('anexo').nullable().after('user_id')
      table.string('numero_despacho').nullable().after('user_id')
      table.string('numero_ordem').nullable().after('user_id');
      table.enum('situacao', ['actual', 'exercída']).defaultTo('actual').after('user_id')
      table.integer('patente_id').unsigned().references('id').inTable('patentes').after('user_id')
      table.integer('pessoajuridica_id')
      .unsigned()
      .references('id')
      .inTable('pessoas')
      .onDelete('RESTRICT')
      table.date('data').nullable().after('user_id')

    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('situacao','petente_id','data_nomeacao','data_exoneracao', 'pessajuridica_id')
    })
  }
}
