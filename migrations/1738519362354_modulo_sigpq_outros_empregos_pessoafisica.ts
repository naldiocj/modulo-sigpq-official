import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_historico_empregos_pessoa_fisica'

  public async up() {
    this.schema.createTable(this.tableName, (table) => { 
      table.increments('id').primary()
      table.integer('empresa_id')
        .unsigned()
        .references('sigpq_empresas.id')
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
      table.text('cargo').notNullable()
      table.text('anexo').nullable()
      table.integer('ano_inicio').notNullable()
      table.integer('ano_fim').nullable()
      table.enum('tipo_de_contrato', [
        'Efectivo', 
        'Estagiário',
        'Temporário',
        'Freelancer'
      ]).nullable(); // Tipo de contrato // Tipo de contrato
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
