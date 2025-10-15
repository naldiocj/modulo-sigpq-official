import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sigdoc_criar_documentos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      
      table.increments('id').primary()
      table.integer("id_tipoDoc").unsigned().references("id").inTable("sigdoc_tipo_correspondencias")
      table.string("referenciaDoc").notNullable()
      table.text('assunto').notNullable()
      table.string('anexo').nullable()
      table.integer('remetente_id').references('id').inTable('pessoajuridicas')
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
