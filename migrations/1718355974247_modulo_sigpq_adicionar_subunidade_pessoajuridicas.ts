import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoajuridicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      this.schema.raw(`ALTER TABLE ${this.tableName} MODIFY COLUMN orgao_comando_provincial ENUM('Comando Provincial', 'Órgão', 'Departamento', 'Unidade', 'Secção', 'Posto Policial', 'Comando Municipal', 'Esquadra', 'Subunidade')`)
      // table.enum('orgao_comando_provincial', ['Comando Provincial', 'Órgão', 'Departamento', 'Unidade', 'Secção', 'Posto Policial', 'Comando Municipal', 'Esquadra', 'Subunidade'])
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('orgao_comando_provincial')
    })
  }
}
