import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_eventos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('titulo').notNullable()
      table.enum('estado', ['P', 'C', 'A', 'R', 'E'])
        .defaultTo('P')
        .comment('P - Pendente, E - Enviado, C - Cancelado, A - Aprovado, R - Recuzado')
        .notNullable()
      table.date('data').notNullable()
      table.boolean('activo').defaultTo(true)
      table.integer('sigpq_tipo_evento_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipo_eventos')
        .onDelete('RESTRICT')
      table.integer('pessoafisica_id')
        .unsigned()
        .references('id')
        .inTable('pessoas')
        .onDelete('RESTRICT')
      table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.text('observacao').nullable()
      table.boolean('eliminado').defaultTo(false)


      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
