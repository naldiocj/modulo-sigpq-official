import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_entrada_expedientes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {

      table.increments('id').primary()
      table.string('codigo_sistema').notNullable()
      table.string('assunto', 255).notNullable()
      table.integer('tipo_proveniencia_id').unsigned().references('id').inTable('sigdoc_tipo_proveniencias')
      table.integer('tipo_natureza_id').unsigned().references('id').inTable('sigdoc_tipo_naturezas')
      table.integer('tipo_correspondencia_id').unsigned().references('id').inTable('sigdoc_tipo_correspondencias')
      table.text('numeroOficio').nullable()
      table.string("referenciaDoc").notNullable()
      table.string("provenienciaDoc").notNullable()
      table.integer('remetente_id').references('id').inTable('pessoajuridicas')
      table.integer('proveniencia_id').references('id').inTable('pessoajuridicas')
      table.dateTime('data_documento', { useTz: true })
      table.string('anexo').nullable()  
      table.string("nomeRemetente").notNullable();
      table.string("contactoRemetente").notNullable();
      table.boolean('eliminado').defaultTo(false)
      table.boolean('activo').defaultTo(true)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.dateTime('created_at', { useTz: true })
      table.dateTime('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
