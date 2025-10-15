import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_tratamento_correspondencias'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.enum('estado',['N', 'D', 'P',]).defaultTo('N')
      
      table.string('cor').defaultTo('#FFA500')
      table.integer('correspondencia_id').unsigned().references('id').inTable('sigpq_correspondencias')

      table.integer('user_id').unsigned().references('id').inTable('users')
      table.boolean('activo').defaultTo(false)
      table.boolean('eliminado').defaultTo(false)


      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
