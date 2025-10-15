import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'distritos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome').notNullable()
      table.string('sigla').notNullable()
      table.string('descricao').nullable()
      table.boolean('activo').defaultTo(true)
      table.integer('municipio_id')
        .unsigned()
        .references('id')
        .inTable('municipios')
        .onDelete('RESTRICT')
      table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.boolean('eliminado').defaultTo(false)
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
