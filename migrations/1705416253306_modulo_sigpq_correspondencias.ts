import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_correspondencias'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.increments('id').primary()
      table.string('codigo_sistema').notNullable()
      table.string('assunto', 255).notNullable()
      table.text('nota').nullable()
      
      
      
    
      table.integer('tipo_natureza_id').unsigned().references('id').inTable('tipo_naturezas')
      table.integer('procedencia_correspondencia_id').unsigned().references('id').inTable('procedencia_correspondencias')
      table.integer('tipo_correspondencia_id').unsigned().references('id').inTable('tipo_correspondencias')
     
      
      table.boolean('eliminado').defaultTo(false)
      table.boolean('activo').defaultTo(true)

      table.integer('user_id').unsigned().references('id').inTable('users')

      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
