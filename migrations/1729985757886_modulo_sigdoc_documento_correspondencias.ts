import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_documento_correspondencias'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('anexo').nullable()
      table.string('pin').notNullable()
      table.string('numero_oficio').notNullable()
      table.integer('correspondencia_id').unsigned().references('id').inTable('sigdoc_correspondencias')
      table.boolean('activo').defaultTo(true)
      table.boolean('eliminado').defaultTo(false)
      table.integer('user_id').unsigned().references('id').inTable('users')

      table.dateTime('data_documento', { useTz: true })

      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}

