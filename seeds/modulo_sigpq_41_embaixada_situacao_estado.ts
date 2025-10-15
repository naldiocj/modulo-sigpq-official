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
     
      const embaixada = await Database.from(this.#table).select('*').where('sigla', 'MDC').where('sigpq_situacao_id', situacao_cns?.id).first()

      if (!embaixada) {
        console.log('Sem dados') 
        return
      }
      const estados: any[] = []
      const estados_rf = [
        {
          nome: "África do Sul",
          sigla: 'AFS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Argélia",
          sigla: 'ARG',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Botswana",
          sigla: 'BTWS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Cabo Verde",
          sigla: 'CBVD',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Egipto",
          sigla: 'EGPT',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Etiópia",
          sigla: 'ETP',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Gabão",
          sigla: 'GB',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Guine-Bissau",
          sigla: 'GUBS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Guine-Conakri",
          sigla: 'GUCN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Guiné Equatorial",
          sigla: 'GUEQ',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Marrocos",
          sigla: 'MRC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Moçambique",
          sigla: 'MOZ',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Namíbia",
          sigla: 'NMB',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Nigéria",
          sigla: 'NGR',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Quênia",
          sigla: 'QN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "República do Congo",
          sigla: 'RC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "República Democrática do Congo",
          sigla: 'RDC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "São Tomé e Príncipe",
          sigla: 'STP',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Tanzânia",
          sigla: 'TNZN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Ruanda",
          sigla: 'RUND',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Zâmbia",
          sigla: 'ZMB',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Zimbábue",
          sigla: 'ZMBB',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Argentina",
          sigla: 'ARGNTN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Brasil",
          sigla: 'BRS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Cuba",
          sigla: 'CB',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Venezuela",
          sigla: 'VNZL',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "China",
          sigla: 'CHN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Coreia do Sul",
          sigla: 'CRS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Emirados Árabes Unidos",
          sigla: 'EAU',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Israel",
          sigla: 'ISRL',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Índia",
          sigla: 'IND',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Japão",
          sigla: 'JP',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Emirados Árabes Unidos",
          sigla: 'EAU',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Rússia",
          sigla: 'RSS',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Sinapura",
          sigla: 'SNGPR',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        
        {
          nome: "Turquia",
          sigla: 'TRQ',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Vietname",
          sigla: 'VTNM',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Alemanha",
          sigla: 'ALMNH',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Áustria",
          sigla: 'ASTR',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Croácia",
          sigla: 'CRC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Eslováquia",
          sigla: 'ESLVQ',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Bélgica",
          sigla: 'BGC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Espanha",
          sigla: 'ES',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "França",
          sigla: 'FR',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Grã-Bretanha",
          sigla: 'GRBTNH',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Eslovênia",
          sigla: 'ELVN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Holanda",
          sigla: 'HLND',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Hungria",
          sigla: 'HNGR',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Itália",
          sigla: 'IT',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Polônia",
          sigla: 'PLN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Portugal",
          sigla: 'PT',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Sérvia",
          sigla: 'SRV',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Suécia",
          sigla: 'SEC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Suíça",
          sigla: 'SUC',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
        {
          nome: "Vaticano",
          sigla: 'VTCN',
          user_id: 1,
          sigpq_situacao_id: situacao_cns?.id,
          sigpq_estado_id: embaixada?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          nome: "Estados Unidos",
          sigla: 'EU',
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
        // .useTransaction(trx).
      }

      // await trx.commit()

    } catch (e) {
      console.log(e)
      // await trx.rollback()
    }
  }
}
