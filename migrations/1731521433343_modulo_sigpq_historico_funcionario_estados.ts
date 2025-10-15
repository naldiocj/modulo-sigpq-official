import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_historico_funcionario_estados'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.boolean('estado').defaultTo(true)
      table.boolean('eliminado').defaultTo(false)
      table.integer('pessoafisica_id').references('id').inTable('pessoafisicas')
      table.integer('sigpq_estado_id').unsigned().references('id').inTable('sigpq_estados').nullable()
      table.integer('sigpq_situacao_id').unsigned().references('id').inTable('sigpq_situacao_estados').nullable()
      table.integer('sigpq_estado_reforma_id').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.dateTime('data_inicio_inatividade').nullable()
      table.integer('duracao_inatividade').nullable()
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
