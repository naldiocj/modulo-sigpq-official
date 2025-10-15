import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_chefias'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      table.integer('pessoajuridica_id').references('id').inTable('pessoajuridicas')
      table.integer('pessoafisica_id').references('id').inTable('pessoafisicas')
      table.integer('user_id').unsigned().references('id').inTable('users')
      
      table.boolean('activo').defaultTo(false)
      table.boolean('eliminado').defaultTo(false)

      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
