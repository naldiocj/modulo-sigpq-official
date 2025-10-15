import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoafisicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('municipio_id').nullable()
      table.integer('distrito_id').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('municipio_id', 'distrito_id')
    })
  }
}
