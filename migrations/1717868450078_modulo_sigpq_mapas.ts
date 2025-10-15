import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_mapas'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('sigpq_tipo_mapa_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipo_mapas')

        
        table.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        
        table.integer("mes_id")
          .unsigned()
          .references('id')
          .inTable('mes')


      table.integer("ano").unsigned()

      table.boolean('activo').defaultTo(true)
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