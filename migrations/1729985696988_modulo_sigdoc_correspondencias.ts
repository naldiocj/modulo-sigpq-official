import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_correspondencias'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.increments('id').primary()
      //table.string('codigo_sistema').notNullable()
      //table.string('assunto', 255).notNullable()
      //table.integer('tipo_correspondencia_id').unsigned().references('id').inTable('sigdoc_tipo_correspondencias')
      //table.integer('tipo_natureza_id').unsigned().references('id').inTable('sigdoc_tipo_naturezas')
      table.text('nota').nullable()
      
      table.boolean('n_lido').defaultTo(true)
      table.boolean('marcado').defaultTo(true)
      table.integer('entrada_expediente_id').unsigned().references('id').inTable('sigdoc_entrada_expedientes')
      table.integer('importancia_id').unsigned().references('id').inTable('sigdoc_tipo_importancias')
      table.integer('procedencia_correspondencia_id').unsigned().references('id').inTable('sigdoc_procedencia_correspondencias')
     
      table.boolean('encaminharDir').defaultTo(false)
      table.integer('tempoResposta').defaultTo(31)
      table.string('pin').notNullable()
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