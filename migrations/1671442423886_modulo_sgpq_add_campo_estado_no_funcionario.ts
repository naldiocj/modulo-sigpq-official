import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pessoafisicas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.string('estado')
        .after('data_nascimento')
        .nullable()

    })
  }

  public async down() {
    
  }
}
