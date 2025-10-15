import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tipo_chefia_comandos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome').notNullable()
      table.string('sigla').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.boolean('activo').defaultTo(true)
      table.boolean('eliminado').defaultTo(false)
      table.enu('nivel', ['muito-alto', 'alto', 'medio', 'baixo', 'moderado'])
      table.string('descricao').nullable()
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
