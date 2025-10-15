import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'
export default class extends BaseSeeder {
  #table = "sigpq_tipos_licencas";
  public async run() {
    // Write your database queries inside the run method

    const dataNew = [
      {
        nome: 'Doença',
        sigla: 'DO',
        dias_maximos: 60,
        limite_anual:12,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Exclusiva da Mãe',
        sigla: 'EM',
        dias_maximos: 120,
        limite_anual:2,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Exclusiva do Pai',
        sigla: 'EP',
        dias_maximos: 7,
        limite_anual:52,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Parental a Gozar pelo Pai por Impossibilidade da Mãe',
        sigla: 'PGPIM',
        dias_maximos: 120,
        limite_anual:12,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Parental a Gozar por Quem Cuide de Pessoas com Necessidades Especiais',
        sigla: 'PGPCN',
        dias_maximos: 30,
        limite_anual:5,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Parental a Gozar por Quem Cuide por Impossibilidade dos Progenitores',
        sigla: 'PGPIP',
        dias_maximos: 120,
        limite_anual:5,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Por Tutela e por Adoção',
        sigla: 'TA',
        dias_maximos: 60,
        limite_anual:5,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Em Situação de Risco Clínico Durante a Gravidez',
        sigla: 'SRDG',
        dias_maximos: 30,
        limite_anual:4,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Por Interrupção da Gravidez',
        sigla: 'IG',
        dias_maximos: 30,
        limite_anual:3,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De Casamento',
        sigla: 'CA',
        dias_maximos: 10,
        limite_anual:4,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De Bodas de Prata e de Ouro',
        sigla: 'BPO',
        dias_maximos: 10,
        limite_anual:1,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Por Luto',
        sigla: 'LU',
        dias_maximos: 8,
        limite_anual:1,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Disciplinar',
        sigla: 'DI',
        dias_maximos: 22,
        limite_anual:1,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Falta',
        sigla: 'FA',
        dias_maximos: 70,
        limite_anual:1,
        exige_anexo:false,
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // await repo.createMany(dataNew)
    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table(this.#table)
        .insert(iterator)
    }

  }
}
