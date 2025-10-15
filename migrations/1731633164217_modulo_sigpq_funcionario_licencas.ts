import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_funcionario_licencas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.boolean('estado').defaultTo(true)
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
      table.integer('situacao_made_by').unsigned().references('id').inTable('users').defaultTo(null).nullable()
      .onDelete('RESTRICT')
      table.dateTime('dia_selecionado').nullable()
      table.string('descricao').nullable()
      table.enum('situacao', ['pendente', 'aprovado', 'rejeitado', 'aguardando'])
        .nullable()
        .defaultTo('pendente')
      table.string('motivo_rejeicao').nullable()
      table.string('anexo').nullable().defaultTo(null)
      table.dateTime('situacao_made_at', { useTz: true }).defaultTo(null).nullable()
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
