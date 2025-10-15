import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table: string = "sigpq_estados"
  #table_: string = "sigpq_situacao_estados"


  public async run() {
    const trx = await Database.transaction()
    try {
     
      const situacao_it = await Database.from({ s: `${this.#table_}` }).select('s.id', 's.sigla').where('s.sigla', 'IT').first();

      const situacao_fa = await Database.from({ s: `${this.#table_}` }).select('s.id', 's.sigla').where('s.sigla', 'FA').first();

      const estados: any[] = []

      // const estados_srs = [
      //   {
      //     nome: "Efectividade",
      //     sigla: 'EFT',
      //     user_id: 1,
      //     sigpq_situacao_id: situacao_srs.id,
      //     descricao: 'Criado automaticamente pelo sistema.',
      //     created_at: new Date(),
      //     updated_at: new Date()

      //   },
      //   {
      //     nome: "Comissão de Normal de Serviço",
      //     sigla: 'CNS',
      //     user_id: 1,
      //     sigpq_situacao_id: situacao_srs.id,
      //     descricao: 'Criado automaticamente pelo sistema.',
      //     created_at: new Date(),
      //     updated_at: new Date()

      //   },
      //   {
      //     nome: "Comissão Especial de Serviço",
      //     sigla: 'CES',
      //     user_id: 1,
      //     sigpq_situacao_id: situacao_srs.id,
      //     descricao: 'Criado automaticamente pelo sistema.',
      //     created_at: new Date(),
      //     updated_at: new Date()

      //   },
      // ]
      const estados_it = [
        {
          nome: "Doença a mais de 12 meses",
          sigla: 'DMDM',
          user_id: 1,
          sigpq_situacao_id: situacao_it.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Cumprimento de Pena Disciplinar/Criminal",
          sigla: 'CPDC',
          user_id: 1,
          sigpq_situacao_id: situacao_it.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Licença para Formação fora da PNA",
          sigla: 'LFFPNA',
          user_id: 1,
          sigpq_situacao_id: situacao_it.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
      ]
      const estados_fa = [
        // {
        //   nome: "Comissão Especial de Serviço",
        //   sigla: 'CES',
        //   user_id: 1,
        //   sigpq_situacao_id: situacao_fa.id,
        //   descricao: 'Criado automaticamente pelo sistema.',
        //   created_at: new Date(),
        //   updated_at: new Date()

        // },
        {
          nome: "Licença Registada ou Ilimitada",
          sigla: 'LRI',
          user_id: 1,
          sigpq_situacao_id: situacao_fa.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Cumprimento de Pena de Prisão Maior",
          sigla: 'CPPM',
          user_id: 1,
          sigpq_situacao_id: situacao_fa.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Reforma",
          sigla: 'RF',
          user_id: 1,
          sigpq_situacao_id: situacao_fa.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
      ]

      estados.push(...estados_it, ...estados_fa)

      for (let item of estados) {
        await Database.insertQuery().table(this.#table).useTransaction(trx).insert(item)
      }

      await trx.commit()

    } catch (e) {
      await trx.rollback()
      console.log(e)
    }
  }
}
