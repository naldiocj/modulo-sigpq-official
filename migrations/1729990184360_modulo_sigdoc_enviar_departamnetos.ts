import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_enviar_departamnetos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('sigdoc_departamento_id').unsigned().references('id').inTable('sigdoc_departamnetos')
      table.integer('remetente_id').references('id').inTable('pessoajuridicas')
      table.integer('pessoajuridica_id').references('id').inTable('pessoajuridicas')

      table.boolean('n_lido').defaultTo(true)
      table.boolean('marcado').defaultTo(true)

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