import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_cursos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => { 
      table.increments('id').primary()
      table.integer('sigpq_tipo_curso_id')
        .unsigned()
        .references('sigpq_tipo_cursos.id')
        .onDelete('RESTRICT')
      table.integer('pessoafisica_id')
        .unsigned()
        .references('pessoas.id')
        .onDelete('RESTRICT')
      table.integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('RESTRICT')
      table.boolean('activo').defaultTo(true)
      table.text('observacao').nullable()
      table.boolean('eliminado').defaultTo(false)

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })

    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
