import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoajuridicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nif');
      table.dropColumn('site');
      table.dropColumn('logotipo');
      table.enum('orgao_comando_provincial', ['Comando Provincial', 'Orgão']).notNullable()
    })
  }

  public async down() {
  }
}
