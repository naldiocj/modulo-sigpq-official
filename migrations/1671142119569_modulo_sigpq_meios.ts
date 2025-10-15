import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_meios'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('pessoafisica_id')
        .unsigned()
        .references('id')
        .inTable('pessoas')
        .onDelete('RESTRICT')
      table.integer('tamanho').unsigned()
      table.integer('quantidade').unsigned() 
      table.integer('sigpq_tipo_meio_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipo_meios')
        .onDelete('RESTRICT')
      // table.integer('pessoajuridica_id')
      //   .unsigned()
      //   .references('id')
      //   .inTable('pessoas')
      //   .onDelete('RESTRICT')
      table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.boolean('activo').defaultTo(true)
      table.string('descricao').nullable()
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
