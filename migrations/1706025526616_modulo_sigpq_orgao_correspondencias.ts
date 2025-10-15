import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_orgao_correspondencias'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('sigpq_correspondencia_id').unsigned().references('id').inTable('sigpq_correspondencias')
      table.integer('remetente_id').references('id').inTable('pessoajuridicas')
      table.integer('pessoajuridica_id').references('id').inTable('pessoajuridicas')

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
