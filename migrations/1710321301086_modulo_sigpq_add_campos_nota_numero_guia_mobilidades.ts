import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tratamento_mobilidades'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('numero_guia').notNullable()
      table.string('nota').notNullable()
    
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns("numero_guia", "nota")
     
    })
  }
}
