import Database from "@ioc:Adonis/Lucid/Database";

interface ParenteConfig {
  campo: string;
  mensagem: string;
}

interface CampoConfig {
  rotulo: string;
  tabela: string;
  coluna: string;
  parente?: ParenteConfig;
  complexo?: boolean;
}

const campos: Record<string, CampoConfig> = {
  provincia: { rotulo: "Província", tabela: "provincias", coluna: "nome" },
  municipio: {
    rotulo: "Município",
    tabela: "municipios",
    coluna: "nome",
    parente: {
      campo: "provincia_id",
      mensagem: "Selecione a Província",
    },
  },
  distrito: {
    rotulo: "Distrito",
    tabela: "distritos",
    coluna: "nome",
    parente: {
      campo: "municipio_id",
      mensagem: "Selecione o Município",
    },
  },
  curso: { rotulo: "Curso", tabela: "sigpq_tipo_cursos", coluna: "nome" },
  grupo_sanguineo: {
    rotulo: "Grupo Sanguíneo",
    tabela: "sigpq_tipo_sanguineos",
    coluna: "nome",
  },
  cargo: { rotulo: "Cargo", tabela: "sigpq_tipo_cargos", coluna: "nome" },
  funcao: { rotulo: "Função", tabela: "sigpq_tipo_funcaos", coluna: "nome" },
  tipo_orgao: {
    rotulo: "Tipo de Órgão",
    tabela: "tipo_estrutura_organicas",
    coluna: "nome",
  },
  direcao: {
    rotulo: "Direcção",
    tabela: "pessoas",
    coluna: "nome_completo",
    complexo: true,
    parente: {
      campo: "tipo_estrutura_sigla",
      mensagem: "Selecione o Tipo de Órgão",
    },
  },
  departamento: {
    rotulo: "Departamento",
    tabela: "pessoas",
    coluna: "nome_completo",
    complexo: true,
    parente: {
      campo: "pessoajuridica_id",
      mensagem: "Selecione a Direcção",
    },
  },
};

export default class AddFieldRepository {
  public async registar(input: any): Promise<any> {
    const config = campos[input.campo];

    if (!config) {
      return Error("Campo não suportado.");
    }

    const nome = String(input.nome ?? "").trim();
    if (!nome) {
      return Error("O campo Nome é obrigatório.");
    }

    if (config.parente && !input[config.parente.campo]) {
      return Error(config.parente.mensagem);
    }

    const nomeUpperCase = nome.toUpperCase();
    const jaExiste = await this.verificarDuplicado(
      config.tabela,
      config.coluna,
      nomeUpperCase
    );

    if (jaExiste) {
      return Error(`${config.rotulo} com este nome já existe`);
    }

    try {
      const id = config.complexo
        ? await this.registarComplexo(input, nomeUpperCase)
        : await this.registarSimples(config, input, nomeUpperCase);

      return { id, nome: nomeUpperCase };
    } catch (e) {
      console.log(e);
      return Error(`Não foi possível criar um novo ${config.rotulo}.`);
    }
  }

  private async verificarDuplicado(
    tabela: string,
    coluna: string,
    valor: string
  ): Promise<boolean> {
    const registo = await Database.from(tabela).where(coluna, valor).first();
    return !!registo;
  }

  private gerarSigla(nome: string): string {
    const iniciais = nome
      .split(" ")
      .filter((palavra) => palavra)
      .map((palavra) => palavra[0])
      .join("")
      .slice(0, 4);

    return iniciais || nome.slice(0, 3);
  }

  private async registarSimples(
    config: CampoConfig,
    input: any,
    nome: string
  ): Promise<any> {
    const dateTime = new Date();

    const valor: any = {
      nome,
      activo: 1,
      user_id: input.user_id,
      created_at: dateTime,
      updated_at: dateTime,
    };

    if (config.parente) {
      valor[config.parente.campo] = input[config.parente.campo];
    }

    if (input.campo === "provincia") {
      valor.sigla = this.gerarSigla(nome);
      valor.pais_id = 1;
    } else if (input.campo === "curso") {
      valor.sigla = this.gerarSigla(nome);
      valor.tipo = "Formação Acadêmica";
    } else if (input.campo === "tipo_orgao") {
      valor.name = nome;
    } else {
      valor.sigla = this.gerarSigla(nome);
    }

    return Database.table(config.tabela).insert(valor);
  }

  private async registarComplexo(input: any, nome: string): Promise<any> {
    const dateTime = new Date();
    const trx = await Database.transaction();

    try {
      const pessoa = {
        nome_completo: nome,
        tipo: "pj",
        activo: 1,
        user_id: input.user_id,
        created_at: dateTime,
        updated_at: dateTime,
      };

      const pessoaId = await Database.table("pessoas")
        .useTransaction(trx)
        .insert(pessoa);

      const pessoaJuridica: any = {
        id: pessoaId,
        sigla: this.gerarSigla(nome),
        pessoajuridica_id: null,
        tipo_pessoajuridica_id: 1,
        activo: 1,
        descricao: null,
        user_id: input.user_id,
        created_at: dateTime,
        updated_at: dateTime,
      };

      if (input.campo === "direcao") {
        pessoaJuridica.tipo_estrutura_organica_sigla =
          input.tipo_estrutura_sigla;
      } else {
        pessoaJuridica.pessoajuridica_id = input.pessoajuridica_id;
      }

      await Database.insertQuery()
        .table("pessoajuridicas")
        .useTransaction(trx)
        .insert(pessoaJuridica);

      await trx.commit();
      return pessoaId;
    } catch (e) {
      await trx.rollback();
      throw e;
    }
  }
}
