import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_licencas_ano_mes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('ano').notNullable()
      table.integer('mes').notNullable()
      table.boolean('eliminado').defaultTo(false)
      table.integer('tipo_licenca_id')
        .unsigned()
        .references('id')
        .inTable('sigpq_tipos_licencas')
        .onDelete('RESTRICT')
      table.integer('pessoafisica_id').references('id').inTable('pessoafisicas')
      .onDelete('RESTRICT')
      table.integer('user_id').unsigned().references('id').inTable('users')
      .onDelete('RESTRICT')
      table.string('motivo').nullable()
      table.string('resposta').nullable()
      table.string('anexo').nullable().defaultTo(null)
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
