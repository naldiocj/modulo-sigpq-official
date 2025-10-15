import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_mais_mobilidades'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('ordenante').notNullable()
      table.integer('pessoafisica_id').references('id').inTable('pessoafisicas')
      

      table.integer('sigpq_fun_id').unsigned().references('id').inTable('sigpq_funcionario_orgaos')

      table.boolean('activo').defaultTo(true)
      table.boolean('eliminado').defaultTo(false)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
