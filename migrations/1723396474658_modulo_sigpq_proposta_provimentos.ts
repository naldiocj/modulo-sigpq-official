import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigpq_proposta_provimentos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('sigpq_funcionario_id').unsigned().references('id').inTable('sigpq_funcionarios')
      table.integer('pessoajuridica_id').references('id').inTable('pessoajuridicas')
      table.integer('sigpq_acto_progressao_id').unsigned().references('id').inTable('sigpq_acto_progressaos')
      table.integer('patente_id').unsigned().references('id').inTable('patentes')
      table.integer('sigpq_tipo_cargo_id').nullable()
      table.integer('sigpq_acto_nomeacao_id').nullable()
      table.string('numero').notNullable()
      table
        .enum("estado", ["P", "A", "EX"])
        .defaultTo("P")
        .comment("P - Pendente, A - Aprovado, EX - Expirado");
      table.string("cor").defaultTo("rgb(254, 176, 25)");
      table.boolean('eliminado').defaultTo(false)
      table.boolean('activo').defaultTo(true)
      table.integer('user_id').unsigned().references('id').inTable('users')

      table.index('sigpq_funcionario_id')
      table.index('pessoajuridica_id')
      table.index('sigpq_acto_progressao_id')
      table.index('patente_id')
      table.index('sigpq_tipo_cargo_id')
      table.index('sigpq_acto_nomeacao_id')
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
