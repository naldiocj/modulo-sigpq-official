import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table: string = "sigpq_estados"
  #table_: string = "sigpq_situacao_estados"
  public async run() {

    // const trx = await Database.transaction()
    try {

      const situacao_cns = await Database.from({ s: `${this.#table_}` }).select('s.id', 's.sigla').where('s.sigla', 'CNS').first();

      if (!situacao_cns) {
        console.log('Sem dados') 
        return
      }
      const estados = [
        {
          nome: "Casa Militar da Presidência da República",
          sigla: 'CMPR',
          user_id: 1,
          sigpq_situacao_id: situacao_cns.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Ministério do Interior",
          sigla: 'MINT',
          user_id: 1,
          sigpq_situacao_id: situacao_cns.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Forças Armadas Angolanas",
          sigla: 'FAA',
          user_id: 1,
          sigpq_situacao_id: situacao_cns.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Serviços de Segurança",
          sigla: 'SS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Missões Diplomáticas",
          sigla: 'MDC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Consulares",
          sigla: 'CNL',
          user_id: 1,
          sigpq_situacao_id: situacao_cns.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Instituições Policias Internacionais",
          sigla: 'IPI',
          user_id: 1,
          sigpq_situacao_id: situacao_cns.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
      ]

      for (let item of estados) {
        // console.log(item)
        await Database.insertQuery().table(this.#table).insert(item)
      }
      // await trx.commit()

    } catch (error) {
      // await trx.rollback()
      console.log(error)
    }

  }
}
