import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'

export default class extends BaseSeeder {

  public async run() {

    // Write your database queries inside the run method
    const resultados = await Promise.all([
      await this.atualizarTabelaPatentesInserindoCategoriaDoRegimeGeral('Técnico Superior', '1'),
      await this.atualizarTabelaPatentesInserindoCategoriaDoRegimeGeral('Técnico', '2'),
      await this.atualizarTabelaPatentesInserindoCategoriaDoRegimeGeral('Técnico Médio', '3'),
      await this.atualizarTabelaPatentesInserindoCategoriaDoRegimeGeral('Administrativo', '4'),
      await this.atualizarTabelaPatentesInserindoCategoriaDoRegimeGeral('Auxiliar', '5')
    ]);

  }

  async atualizarTabelaPatentesInserindoCategoriaDoRegimeGeral(tipo_formacao_nome: string, type: string) {
    const busca = tipo_formacao_nome
    const resultado = await Database
      .from("sigpq_tipo_carreiras") // substitua 'sua_tabela' pelo nome da sua tabela
      .where('nome', 'LIKE', `${busca}`)
      .first();

    if (resultado) {
      const mapeamentoFormacoes = {
        '1': this.listagem_tecnico_superior(resultado.id),
        '2': this.listagem_tecnico(resultado.id),
        '3': this.listagem_tecnico_medio(resultado.id),
        '4': this.listagem_administrativo(resultado.id),
        '5': this.listagem_auxiliar(resultado.id)
      };

      const funcaoSelecionada = mapeamentoFormacoes[type];

      // Insere os dados no banco de dados
      if (funcaoSelecionada) {
        const insertData = await Database
          .table("patentes") // Substitua pelo nome da sua tabela
          .insert(funcaoSelecionada);
        if (type == '2') this.atualizarApatenteTecnicoCivilParaReceberUmaClasse(resultado.id)
      }

    }
  }

  async atualizarApatenteTecnicoCivilParaReceberUmaClasse(sigpq_tipo_carreira_id: string) {
    if (sigpq_tipo_carreira_id) {
      const update = await Database
        .from("patentes") // substitua 'this.#table' pelo nome da sua tabela
        .where('nome', 'LIKE', `Técnico Civil`)
        .update({
          sigpq_tipo_carreira_id: sigpq_tipo_carreira_id,
          classe: 'Técnica'
        });
    }
  }

  listagem_tecnico_superior(sigpq_tipo_carreira_id: string) {
    const listagem_tecnico_superior = [
      {
        nome: 'Assessor Principal',
        sigla: 'AP',
        classe: 'Técnica Superior',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: '1.º Assessor',
        sigla: '1A',
        classe: 'Técnica Superior',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Assessor',
        sigla: 'AS',
        classe: 'Técnica Superior',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico Superior Principal',
        sigla: 'TSP',
        classe: 'Técnica Superior',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico Superior de 1.ª Classe',
        sigla: 'TS1',
        classe: 'Técnica Superior',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico Superior de 2.ª Classe',
        sigla: 'TS2',
        classe: 'Técnica Superior',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return listagem_tecnico_superior;
  }

  listagem_tecnico(sigpq_tipo_carreira_id: string) {
    const listagem_tecnico = [
      {
        nome: 'Especialista Principal',
        sigla: 'EP',
        classe: 'Técnica',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Especialista 1ª Classe',
        sigla: 'E1',
        classe: 'Técnica',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Especialista 2ª Classe',
        sigla: 'E2',
        classe: 'Técnica',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico de 1ª Classe',
        sigla: 'T1',
        classe: 'Técnica',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico de 2ª Classe',
        sigla: 'T2',
        classe: 'Técnica',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico de 3ª Classe',
        sigla: 'T3',
        classe: 'Técnica',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return listagem_tecnico;
  }

  listagem_tecnico_medio(sigpq_tipo_carreira_id: string) {
    const listagem_tecnico_medio = [
      {
        nome: 'Técnico Médio Principal de 1ª Classe',
        sigla: 'TMP1',
        classe: 'Técnica Média',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico Médio Principal de 2ª Classe',
        sigla: 'TMP2',
        classe: 'Técnica Média',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico Médio Principal de 3ª Classe',
        sigla: 'TMP3',
        classe: 'Técnica Média',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico Médio de 1ª Classe',
        sigla: 'TM1',
        classe: 'Técnica Média',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico Médio de 2ª Classe',
        sigla: 'TM2',
        classe: 'Técnica Média',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Técnico Médio de 3ª Classe',
        sigla: 'TM3',
        classe: 'Técnica Média',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return listagem_tecnico_medio;
  }

  listagem_administrativo(sigpq_tipo_carreira_id: string) {
    const listagem_administrativo = [
      {
        nome: 'Oficial Administrativo Principal',
        sigla: 'OAP',
        classe: 'Administrativa',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: '1.º Oficial',
        sigla: '1OF',
        classe: 'Administrativa',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: '2.º Oficial',
        sigla: '2OF',
        classe: 'Administrativa',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: '3.º Oficial',
        sigla: '3OF',
        classe: 'Administrativa',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Aspirante',
        sigla: 'ASP',
        classe: 'Administrativa',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Motorista de Pesados Principal',
        sigla: 'MPP',
        classe: 'Motorista de Pesados',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Motorista de Pesados de 1.ª Classe',
        sigla: 'MP1',
        classe: 'Motorista de Pesados',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Motorista de Pesados de 2.ª Classe',
        sigla: 'MP2',
        classe: 'Motorista de Pesados',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Motorista de Ligeiros Profissional',
        sigla: 'MLP',
        classe: 'Motorista de Ligeiros',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Motorista de Ligeiros de 1.ª Classe',
        sigla: 'ML1',
        classe: 'Motorista de Ligeiros',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Motorista de Ligeiros de 2.ª Classe',
        sigla: 'ML2',
        classe: 'Motorista de Ligeiros',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return listagem_administrativo;
  }

  listagem_auxiliar(sigpq_tipo_carreira_id: string) {
    const listagem_auxiliar = [
      {
        nome: 'Auxiliar Administrativo Principal',
        sigla: 'AAP',
        classe: 'Auxiliar Administrativa',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Auxiliar Administrativo de 1.ª Classe',
        sigla: 'AA1',
        classe: 'Auxiliar Administrativa',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Auxiliar Administrativo de 2.ª Classe',
        sigla: 'AA2',
        classe: 'Auxiliar Administrativa',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Auxiliar de Limpeza Principal',
        sigla: 'ALP',
        classe: 'Auxiliar de Limpeza',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Auxiliar de Limpeza de 1.ª Classe',
        sigla: 'AL1',
        classe: 'Auxiliar de Limpeza',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Auxiliar de Limpeza de 2.ª Classe',
        sigla: 'AL2',
        classe: 'Auxiliar de Limpeza',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Encarregado Principal',
        sigla: 'ENP',
        classe: 'Operário Qualificado',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Encarregado de 1.ª Classe',
        sigla: 'EN1',
        classe: 'Operário Qualificado',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Encarregado de 2.ª Classe',
        sigla: 'EN2',
        classe: 'Operário Qualificado',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Encarregado Não Qualificado',
        sigla: 'ENQ',
        classe: 'Operário não Qualificado',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Operário Não Qualificado de 1.ª Classe',
        sigla: 'ON1',
        classe: 'Operário não Qualificado',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Operário Não Qualificado de 2.ª Classe',
        sigla: 'ON2',
        classe: 'Operário não Qualificado',
        user_id: 2,
        activo: true,
        eliminado: false,
        sigpq_tipo_carreira_id: Number(sigpq_tipo_carreira_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return listagem_auxiliar;
  }
}
