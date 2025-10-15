import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table: string = "sigpq_estados"
  #table_: string = "sigpq_situacao_estados"
  public async run() {


    // const trx = await Database.transaction()
    try {

      const situacao_ces = await Database.from({ s: `${this.#table_}` }).select('s.id', 's.sigla').where('s.sigla', 'CES').first();
      if (!situacao_ces) {
        console.log('Sem dados') 
        return
      }
      const estados = [
        {
          nome: "Ministério da Defesa Nacional",
          sigla: 'MDN',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Ministério do Interior",
          sigla: 'MINT',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Ministério das Relações Exteriores",
          sigla: 'MIREX',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Ministério das Finanças",
          sigla: 'MINF',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Economia e Planeamento",
          sigla: 'MEP',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Administração do Território",
          sigla: 'MAT',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Justiça e dos Direitos Humanos",
          sigla: 'MJDH',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Administração Pública, Trabalho e Segurança Social",
          sigla: 'MAPTSS',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Ministério da Agricultura e Floresta",
          sigla: 'MIAF',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Ministério das Pescas e Recursos e Florestas",
          sigla: 'MPRF',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        }
        ,
        {
          nome: "Ministério do Comércio e Indústria",
          sigla: 'MINCI',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério dos Recursos Minerais, Petróleo e Gás",
          sigla: 'MRMPG',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério das Obras Públicas, Urbanismo e Habitação",
          sigla: 'MOPUH',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Energia e Águas",
          sigla: 'MINEA',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério dos Transportes",
          sigla: 'MINT',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério das Telecomunicações, Tecnologias de Informação e Comunicação Social",
          sigla: 'MINTICS',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério do Ensino Superior, Ciência, Tecnologia e Inovação",
          sigla: 'MINT',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Saúde",
          sigla: 'MINS',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Educação",
          sigla: 'MINED',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Cultura e Turismo",
          sigla: 'MINCT',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério do Ambiente",
          sigla: 'MINA',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Acção Social, Família e Promoção da Mulher",
          sigla: 'MINFAM',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ministério da Juventude e Desportos",
          sigla: 'MINJD',
          user_id: 1,
          sigpq_situacao_id: situacao_ces.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
      ]
      for (let item of estados) {
        await Database.insertQuery().table(this.#table)
        .insert(item)
        // .useTransaction(trx)
      }

      // await trx.commit()
    } catch (error) {
      // await trx.rollback()
      console.log(error)
    }

  }
}
