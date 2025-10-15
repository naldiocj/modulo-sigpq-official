import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_departamnetos' //sigdoc_tratamento_departamnetos

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary
      table.text('nota').nullable()
      table.string('numero_oficio', 255).notNullable()
      table.integer('correspondencia_id').unsigned().references('id').inTable('sigdoc_correspondencias')
      table.integer('procedencia_correspondencia_id').unsigned().references('id').inTable('sigdoc_procedencia_correspondencias')
      table.boolean('lido').defaultTo(false)
      table.integer('tempoResposta').defaultTo(31)
      table.boolean('encaminharDir').defaultTo(false)
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
