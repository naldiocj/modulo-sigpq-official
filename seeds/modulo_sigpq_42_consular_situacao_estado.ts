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

      const embaixada = await Database.from(this.#table).select('*').where('sigla', 'CNL').where('sigpq_situacao_id', situacao_cns?.id).first()

      if (!embaixada) {
        console.log('Sem dados') 
        return
      }
     
      const estados: any[] = []
      const estados_rf = [
        {
          nome: "África do Sul",
          sigla: 'CAFS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Namíbia",
          sigla: 'CNMB',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        
        {
          nome: "República do Centro Africano",
          sigla: 'CRCA',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "República Democrática do Congo",
          sigla: 'CRDC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
       
        {
          nome: "Zâmbia",
          sigla: 'CZMB',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Brasil",
          sigla: 'CBRS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Estados Unidos",
          sigla: 'CEU',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Uruguai",
          sigla: 'CURG',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "China",
          sigla: 'CCHN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Emirados Árabes Unidos",
          sigla: 'CEAU',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        
        {
          nome: "Holanda",
          sigla: 'CHLND',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Portugal",
          sigla: 'CPT',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        
      ]
      estados.push(...estados_rf)

      for (let item of estados) {
        await Database.insertQuery().table(this.#table)
        .insert(item)
        // .useTransaction(trx)
      }

      // await trx.commit()

    } catch (e) {
      console.log(e)
      // await trx.rollback()
    }
  }
}
