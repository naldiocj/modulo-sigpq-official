import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_procedencia_correspondencias'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome').notNullable()
      table.string('sigla').notNullable()
      table.string('descricao').nullable()
      table.boolean('eliminado').defaultTo(false)
      table.boolean('activo').defaultTo(true)
      table.integer('user_id').unsigned().references('id').inTable('users')
      
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
