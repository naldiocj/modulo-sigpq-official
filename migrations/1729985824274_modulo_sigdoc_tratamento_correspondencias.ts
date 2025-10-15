import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_tratamento_correspondencias'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
  
      table.enum('estado', ['R','ET','S', 'D', 'P', 'E', 'PR', 'PAR', 'PA']).defaultTo('P').comment('R - Recebido, ET - Em Tratamento, S - Saído, D-Despacho, P-Pendente, E - Expedido, PR - Pronunciamento, PAR - Parecer, PA - Portal do Agente')
      
      table.string('nota').defaultTo(null)
      table.boolean('activo').defaultTo(true)
      table.integer('pessoafisica_id').references('id').inTable('pessoafisicas')
      
      table.string('cor').defaultTo('#FFA500')
      table.integer('correspondencia_id').unsigned().references('id').inTable('sigdoc_correspondencias')

      table.integer('user_id').unsigned().references('id').inTable('users')
      table.boolean('eliminado').defaultTo(false)


      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
