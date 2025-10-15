import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table: string = "sigpq_estados"
  #table_: string = "sigpq_situacao_estados"
  public async run() {


    const trx = await Database.transaction()
    try {

      const situacao_fa = await Database.from({ s: `${this.#table_}` }).select('s.id', 's.sigla').where('s.sigla', 'FA').first();
      const estados = [
        {
          nome: "Comissão Especial de Serviço",
          sigla: 'CES',
          user_id: 1,
          sigpq_situacao_id: situacao_fa.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
      ]

      for (let item of estados) {
        await Database.insertQuery().table(this.#table).useTransaction(trx).insert(item)
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      console.log(error)
    }

  }
}
