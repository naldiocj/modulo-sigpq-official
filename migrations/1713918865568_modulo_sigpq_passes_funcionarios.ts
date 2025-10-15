import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_passes_funcionarios'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('sigpq_funcionario_id').unsigned().references('id').inTable('sigpq_funcionarios')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.boolean('activo').defaultTo(true)
      table.boolean('eliminado').defaultTo(false)
      table.string('codigo').notNullable()
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
