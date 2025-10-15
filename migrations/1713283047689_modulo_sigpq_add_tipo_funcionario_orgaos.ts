import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_orgaos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('nivel_colocacao', ['muito-alto', 'alto', 'medio', 'baixo', 'moderado']).defaultTo('muito-alto').comment('muito-alto - Direcção / Comando Provincial, alto - Departamento / Comando Municipal, medio - Secção / Esquadra, baixo - Posto Policial, moderado - Unidade')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nivel_colocacao')
    })
  }
}
