import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_tipo_importancias'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome').notNullable()
      table.string('sigla').notNullable()
      table.string('codigo').notNullable()
      table.boolean('eliminado').defaultTo(false)
      table.boolean('activo').defaultTo(false)
      table.string('descricao').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users')

      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
