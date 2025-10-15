import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'
export default class extends BaseSeeder {

  public async run() {
    const resultados = await Promise.all([
      await this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('FORMAÇÃO TÉCNICO POLICIAL', '1'),
      await this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('FORMAÇÃO ACADÊMICA', '2'),
      await this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('OUTRAS FORMAÇÕES', '3')
    ]);
  }

  async atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao(tipo_formacao_nome: string, type: string) {
    const busca = tipo_formacao_nome
    const resultado = await Database
      .from("sigpq_tipo_formacao") // substitua 'sua_tabela' pelo nome da sua tabela
      .where('nome', 'LIKE', `%${busca}%`)
      .first();

    if (resultado) {
      const mapeamentoFormacoes = {
        '1': this.listaDeInstituicaoesPoliciais(resultado.id),
        '2': this.listaDeInstituicaoesAcademicas(resultado.id),
        '3': this.listaDeOutrasInstituicaoes(resultado.id)
      };


      const funcaoSelecionada = mapeamentoFormacoes[type];

      // Insere os dados no banco de dados
      if (funcaoSelecionada) {
        const insertData = await Database
          .table("sigpq_instituicao_de_ensino") // Substitua pelo nome da sua tabela
          .insert(funcaoSelecionada);

      }

    }
  }

  listaDeInstituicaoesAcademicas(tipo_de_formacao_id: string) {
    const lista_instituicoes = [
      {
        nome: 'Instituto Superior Politécnico de Tecnologias e Ciências',
        sigla: 'ISPTEC',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Agostinho Neto',
        sigla: 'UAN',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Católica de Angola',
        sigla: 'UCAN',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Lusíada de Angola',
        sigla: 'ULA',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Jean Piaget de Angola',
        sigla: 'UNIPIAGET',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Instituto Superior de Ciências da Educação',
        sigla: 'ISCED',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Metodista de Angola',
        sigla: 'UMA',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Óscar Ribas',
        sigla: 'UOR',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Privada de Angola',
        sigla: 'UPRA',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Técnica de Angola',
        sigla: 'UTANGA',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }, {
        nome: 'Universidade Independente de Angola',
        sigla: 'UNIA',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Universidade privada situada em Luanda.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade 11 de Novembro',
        sigla: 'UON',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Universidade pública localizada em Cabinda.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade José Eduardo dos Santos',
        sigla: 'UJES',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Universidade pública com sede no Huambo.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Katyavala Bwila',
        sigla: 'UKB',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Universidade pública situada em Benguela.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Kimpa Vita',
        sigla: 'UNIKIVI',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Universidade pública localizada no Uíge.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Lueji A\'Nkonde',
        sigla: 'ULAN',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Universidade pública com sede em Dundo.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade Mandume ya Ndemufayo',
        sigla: 'UMN',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Universidade pública situada no Lubango.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Universidade de Namibe',
        sigla: 'UNINBE',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Universidade pública localizada em Moçâmedes.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Escola Portuguesa de Luanda',
        sigla: 'EPL',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Escola privada que segue o currículo português, localizada em Luanda.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Luanda International School',
        sigla: 'LIS',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Escola internacional que oferece o currículo IB (International Baccalaureate) em Luanda.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Colégio Português de Luanda',
        sigla: 'CPL',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Instituição de ensino que oferece educação de qualidade seguindo o currículo português.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Instituto Médio de Economia de Luanda',
        sigla: 'IMEL',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Instituto médio focado em cursos de economia e gestão.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Instituto Médio Politécnico da Humpata',
        sigla: 'IMPH',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Instituto politécnico localizado na Humpata, oferecendo cursos técnicos.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Instituto Politécnico Industrial de Luanda',
        sigla: 'IPIL',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Instituto técnico focado em cursos industriais em Luanda.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Magistério Mutu-ya-Kevela',
        sigla: 'MMK',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Instituição de formação de professores localizada em Luanda.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Complexo Escolar Privado Emirais',
        sigla: 'CEPE',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Complexo escolar privado reconhecido pela sua excelência educativa.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Liceu Alioune Blondin Beye',
        sigla: 'LABB',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Escola francesa que faz parte da rede de estabelecimentos franceses no estrangeiro.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return lista_instituicoes;

  }

  listaDeInstituicaoesPoliciais(tipo_de_formacao_id: string) {
    const lista_instituicoes_ensino_policial = [
      {
        nome: 'Instituto Superior de Ciências Policiais e Criminais de Angola',
        sigla: 'ISCPC',
        user_id: null,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Formação superior para oficiais da Polícia Nacional, oferecendo cursos em ciências policiais e criminais.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Escola Prática de Polícia',
        sigla: 'EPP',
        user_id: null,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Centro de formação responsável pelo treinamento prático de agentes da Polícia Nacional de Angola.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Escola de Formação de Oficiais da Polícia Nacional',
        sigla: 'EFOPN',
        user_id: null,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Formação específica para oficiais da Polícia Nacional, garantindo treinamento tático e operacional.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Escola Nacional de Formação de Bombeiros',
        sigla: 'ENFB',
        user_id: null,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Centro de ensino especializado na formação de bombeiros e técnicos de emergência.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Academia Militar do Exército',
        sigla: 'AME',
        user_id: null,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Ensino superior para formação de oficiais do Exército e forças de segurança.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Instituto Superior Técnico Militar das Forças Armadas Angolanas',
        sigla: 'ISTM-FAA',
        user_id: null,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Formação superior militar voltada para o desenvolvimento de quadros técnicos das Forças Armadas Angolanas.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return lista_instituicoes_ensino_policial

  }

  listaDeOutrasInstituicaoes(tipo_de_formacao_id: string) {
    const lista_centros_formacao = [
      {
        nome: 'Centro de Formação ITGest',
        sigla: 'ITGest',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Centro certificado que oferece formação profissional em diversas áreas, incluindo certificações SAP reconhecidas mundialmente.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Instituto Nacional de Emprego e Formação Profissional',
        sigla: 'INEFOP',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Instituição pública que promove a formação profissional e o emprego em Angola.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Centro de Formação Técnico Profissional da ENDIAMA',
        sigla: 'CEFOPE',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Centro focado na formação de técnicos para a indústria diamantífera e outras áreas técnicas.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Insignis West',
        sigla: 'IW',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Empresa certificada que oferece soluções de formação e consultoria em diversas áreas, incluindo telecomunicações e energia.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Câmara de Comércio e Indústria de Angola - Formação',
        sigla: 'CCIA',
        user_id: 2,
        activo: true,
        eliminado: false,
        tipo_formacao_id: Number(tipo_de_formacao_id),
        descricao: 'Oferece programas de formação para promover o desenvolvimento industrial e comercial em Angola.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];


    return lista_centros_formacao;

  }
}
