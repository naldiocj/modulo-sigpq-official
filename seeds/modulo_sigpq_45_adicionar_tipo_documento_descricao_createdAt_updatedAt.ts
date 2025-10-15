import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_documentos"
  public async run() {


    // const trx = await Database.transaction()

    try {

      await Database.from(this.#table).whereNull('descricao').whereNull('created_at').whereNull('updated_at').update({
        descricao: 'Criado automaticamente pelo sistema',
        user_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      })
      // .useTransaction(trx)


      const documentos = [
        {
          nome: 'Ordem de Serviço',
          sigla: 'OS',
          descricao: 'Criado automaticamente pelo sistema',
          activo: 1,
          user_id: 1,
          ...this.getData

        },
        {
          nome: 'Guia de Marcha',
          sigla: 'OS',
          descricao: 'Criado automaticamente pelo sistema',
          activo: 1,
          user_id: 1,
          ...this.getData

        }
      ]

      for (let item of documentos) {
        await Database.insertQuery().table(this.#table)
        .insert(item)
        // .useTransaction(trx)
      }


      // await trx.commit()

    } catch (error) {
      console.log(error)
      // await trx.rollback()

    }


  }


  public async getData() {
    return {
      created_at: new Date(),
      updated_at: new Date()
    }
  }

}
