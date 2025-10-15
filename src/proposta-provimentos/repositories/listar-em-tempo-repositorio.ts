import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";

import OrgaoRepository from "App/Repositories/OrgaoRepository";

// import { QueryableBase } from 'mysql2/typings/mysql/lib/protocol/sequences/QueryableBase';

export default class ListarEmTempoRepository {
  #orgRepo: OrgaoRepository;

  constructor() {
    this.#orgRepo = new OrgaoRepository();
  }

  public async listarPorPessoa(pessoaId: any): Promise<any> {
    try {
      let query: any = await Database.from({ f: "sigpq_funcionarios" })
        .select(
          "pessoas.nome_completo",
          "pessoas.activo",
          "pessoafisicas.genero",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.descricao",
          "patentes.nome as patente_nome",
          "patentes.sigpq_tipo_carreira_id as patente_classe",
          "patentes.classe as patenteClasse",
          "f.id",
          "patentes.id as patente_id",
          "sigpq_provimentos.ordem_descricao",
          "sigpq_provimentos.despacho_descricao",
          "regimes.quadro",
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas", "pessoas.id", "f.id")
        .innerJoin("pessoafisicas", "pessoafisicas.id", "f.id")
        .innerJoin(
          "sigpq_provimentos",
          "sigpq_provimentos.pessoa_id",
          "pessoas.id"
        )
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin("regimes", "regimes.id", "pessoafisicas.regime_id")
        .where("sigpq_provimentos.activo", true)
        .where("pessoa_id", pessoaId)
        .first();
      return query;
    } catch (e) {
      return Error("Não foi possível listar o registo.");
    }
  }

  public listarEmTempo(options: any, orgao: any): DatabaseQueryBuilderContract {
    let query: DatabaseQueryBuilderContract = Database.from({
      f: "sigpq_funcionarios",
    })
      .select(
        Database.raw("upper(pessoas.nome_completo) as nome_completo"),
        "pessoas.activo",
        "pessoafisicas.genero",
        "f.nip",
        "f.numero_processo",
        "f.numero_agente",
        "f.foto_efectivo",
        "f.descricao",
        "pessoafisicas.apelido",
        "patentes.nome as patente_nome",
        "patentes.sigpq_tipo_carreira_id as patente_classe",
        "patentes.classe as patenteClasse",
        "f.id",
        "patentes.id as patente_id",
        // 'sigpq_provimentos.data_provimento',
        "patentes.duracao",
        "sigpq_provimentos.ordem_descricao",
        "sigpq_provimentos.despacho_descricao",
        "regimes.quadro",
        "pessoajuridicas.sigla as orgao_sigla",
        "orgao.nome_completo as orgao",
        "sigpq_acto_progressaos.nome as acto",

        Database.raw(
          "YEAR(DATE(sigpq_provimentos.data_provimento)) as ano_acto"
        ),
        Database.raw(
          "(YEAR(NOW()) - YEAR(DATE(sigpq_provimentos.data_provimento))) as acto_duracao"
        ),
        Database.raw(
          "DATE_FORMAT(sigpq_provimentos.data_provimento, '%d/%m/%Y %H:%i:%s') as data_provimento"
        ),
        Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
        Database.raw(
          "DATE_FORMAT(pessoafisicas.data_nascimento, '%d/%m/%Y') as data_nascimento"
        ),
        Database.raw(
          "DATE_FORMAT(sigpq_provimentos.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
        ),
        Database.raw(
          "DATE_FORMAT(sigpq_provimentos.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
        )
      )
      .innerJoin("pessoas", "pessoas.id", "f.id")
      .innerJoin("pessoafisicas", "pessoafisicas.id", "f.id")
      .innerJoin(
        "sigpq_provimentos",
        "sigpq_provimentos.pessoa_id",
        "pessoas.id"
      )
      .innerJoin(
        "sigpq_funcionario_orgaos",
        "sigpq_funcionario_orgaos.pessoafisica_id",
        "f.id"
      )
      .innerJoin(
        "pessoajuridicas",
        "pessoajuridicas.id",
        "sigpq_funcionario_orgaos.pessoajuridica_id"
      )
      .innerJoin("pessoas as orgao", "orgao.id", "pessoajuridicas.id")
      .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
      .innerJoin("regimes", "regimes.id", "pessoafisicas.regime_id")
      .innerJoin(
        "sigpq_acto_progressaos",
        "sigpq_acto_progressaos.id",
        "sigpq_provimentos.acto_progressao_id"
      )
      .leftJoin("sigpq_funcionario_estados as fe", "fe.pessoafisica_id", "f.id")
      .leftJoin("sigpq_situacao_estados as se", "se.id", "fe.sigpq_situacao_id")
      .leftJoin("sigpq_estados as es", "es.id", "fe.sigpq_estado_id")
      .whereRaw(
        `
        CASE
          WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
             TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) >  patentes.duracao
        END
      `
      );

    if (options.mais_ano) {
      query.whereRaw(`
              CASE
                WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
                   TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) > ${options.mais_ano}
              END
            `);
    }

    if (options.regimeId) {
      query.where("pessoafisicas.regime_id", options.regimeId);
    }
    if (options.mais_ano) {
      query.whereRaw(`
                CASE
                  WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) >  ${options.mais_ano}
                END
              `);
    }
    if (options.idadeMenos || options.idadeMais) {
      if (options.idadeMenos == options.idadeMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) = ${options.idadeMenos}
                  END
                `);
      } else if (options.idadeMenos < options.idadeMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) >= ${options.idadeMenos} and  TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) <= ${options.idadeMais}
                  END
                `);
      } else if (options.idadeMenos && !options.idadeMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) >= ${options.idadeMenos}
                  END
                `);
      } else if (
        !options.idadeMenos &&
        options.idadeMais &&
        options.idadeMais > 18
      ) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) >= 18 and  TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) <= ${options.idadeMais}
                  END
                `);
      } else if (options.idadeMenos > options.idadeMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) > ${options.idadeMenos}
                  END
                `);
      }
    }
    if (options.anoMenos || options.anoMais) {
      if (options.anoMenos == options.anoMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) = ${options.anoMenos}
                  END
                `);
      } else if (options.anoMenos < options.anoMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos} and TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) <= ${options.anoMais}
                  END
                `);
      } else if (options.anoMenos && !options.anoMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
                  END
                `);
      } else if (!options.anoMenos && options.anoMais && options.anoMais > 18) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= 18 and TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) <= ${options.anoMais}
                  END
                `);
      } else if (options.anoMenos > options.anoMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
                  END
                `);
      }
    }
    if (options.sigpq_acto_progressao_id) {
      query.where(
        "sigpq_acto_progressaos.id",
        options.sigpq_acto_progressao_id
      );
    }
    if (options.user.aceder_todos_agentes) {
      if (options.orgaoId) {
        query.where(
          "sigpq_funcionario_orgaos.pessoajuridica_id",
          options.orgaoId
        );
      }
    } else {
      query.where("sigpq_funcionario_orgaos.pessoajuridica_id", orgao?.id);
    }
    if (options.regimeId) {
      query.where("pessoafisicas.regime_id", Number(options.regimeId));
    }
    if (options.patenteId) {
      query.where("patente_id", Number(options.patenteId));
    }
    if (options.tipoVinculoId) {
      query.where("f.sigpq_tipo_vinculo_id", Number(options.tipoVinculoId));
    }
    if (options.tipoOrgao_id) {
      query.whereLike("pj.orgao_comando_provincial", options.tipoOrgao_id);
    }
    if (options.user?.aceder_todos_agentes) {
      if (options.orgaoId) {
        query.where(
          "sigpq_funcionario_orgaos.pessoajuridica_id",
          options.orgaoId
        );
      }
      if (options.tipoOrgaoId) {
        query.where(
          "pessoajuridicas.tipo_estrutura_organica_sigla",
          options.tipoOrgaoId
        );
      }
    } else {
      query.where(
        "sigpq_funcionario_orgaos.pessoajuridica_id",
        options.orgao?.id
      );
    }
    if (options.genero) {
      query.where("pessoafisicas.genero", options.genero);
    }
    if (options.estadoId) {
      query.where("fe.sigpq_estado_id", options.estadoId);
    }
    if (options.situacaoId) {
      query.where("fe.sigpq_situacao_id", options.situacaoId);
    }
    if (options.forcaPassiva) {
      query.where("fe.sigpq_situacao_id", "<>", options.forcaPassiva);
    }
    if (options.patenteClasse) {
      query.where("patentes.sigpq_tipo_carreira_id", options.patenteClasse);
    }

    if (options.search) {
      query.where("pessoas.nome_completo", "like", `%${options.search}%`);
      query.orWhere("f.nip", "like", `%${options.search}%`);
      query.orWhere("f.numero_agente", "like", `%${options.search}%`);
      query.orWhere("patentes.nome", "like", `%${options.search}%`);
      query.orWhere("patentes.classe", "like", `%${options.search}%`);
      query.orWhere(
        "sigpq_provimentos.ordem_descricao",
        "like",
        `%${options.search}%`
      );
      query.orWhere("regimes.quadro", "like", `%${options.search}%`);
      query.orWhere("pessoajuridicas.sigla", "like", `%${options.search}%`);
      query.orWhere("orgao.nome_completo", "like", `%${options.search}%`);
      query.orWhere(
        "sigpq_acto_progressaos.nome",
        "like",
        `%${options.search}%`
      );
      query.orWhere("patentes.duracao", "like", `%${options.search}%`);
      // query.orWhereRaw(
      //   "concat(pessoas.nome_completo, ' ',pessoafisicas.apelido) like " +
      //     `%${options.search}%`
      // );
    }

    if (options.numero) {
      // query.select('sigpq_tipo_cargos.nome as cargo')
      // query.innerJoin('sigpq_cargos', 'sigpq_cargos.pessoafisica_id', 'f.id')
      // query.leftJoin('sigpq_tipo_cargos', 'sigpq_tipo_cargos.id', 'sigpq_cargos.sigpq_tipo_cargo_id')
      // query.where('sigpq_cargos.situacao', 'actual')
      query.where("sigpq_provimentos.ordem_descricao", options.numero);
    }

    if (options.pessoaId && options.numero) {
      query
        .where("f.id", options.pessoaId)
        .where("sigpq_provimentos.ordem_descricao", options.numero);
    }

    return query;
  }

  public listarExceptos(
    options: any,
    orgao: any
  ): DatabaseQueryBuilderContract {
    let query: DatabaseQueryBuilderContract = Database.from({
      f: "sigpq_funcionarios",
    })
      .select(
        Database.raw("upper(pessoas.nome_completo) as nome_completo"),
        "pessoas.activo",
        "pessoafisicas.genero",
        "f.nip",
        "f.numero_processo",
        "f.numero_agente",
        "f.foto_efectivo",
        "f.descricao",
        "pessoafisicas.apelido",
        "patentes.nome as patente_nome",
        "patentes.sigpq_tipo_carreira_id as patente_classe",
        "patentes.classe as patenteClasse",
        "f.id",
        "patentes.id as patente_id",
        // 'sigpq_provimentos.data_provimento',
        "patentes.duracao",
        "sigpq_provimentos.ordem_descricao",
        "sigpq_provimentos.despacho_descricao",
        "regimes.quadro",
        "pessoajuridicas.sigla as orgao_sigla",
        "orgao.nome_completo as orgao",
        "sigpq_acto_progressaos.nome as acto",

        Database.raw(
          "YEAR(DATE(sigpq_provimentos.data_provimento)) as ano_acto"
        ),
        Database.raw(
          "(YEAR(NOW()) - YEAR(DATE(sigpq_provimentos.data_provimento))) as acto_duracao"
        ),
        Database.raw(
          "DATE_FORMAT(sigpq_provimentos.data_provimento, '%d/%m/%Y %H:%i:%s') as data_provimento"
        ),
        Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
        Database.raw(
          "DATE_FORMAT(pessoafisicas.data_nascimento, '%d/%m/%Y') as data_nascimento"
        ),
        Database.raw(
          "DATE_FORMAT(sigpq_provimentos.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
        ),
        Database.raw(
          "DATE_FORMAT(sigpq_provimentos.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
        )
      )
      .innerJoin("pessoas", "pessoas.id", "f.id")
      .innerJoin("pessoafisicas", "pessoafisicas.id", "f.id")
      .innerJoin(
        "sigpq_provimentos",
        "sigpq_provimentos.pessoa_id",
        "pessoas.id"
      )
      .innerJoin(
        "sigpq_funcionario_orgaos",
        "sigpq_funcionario_orgaos.pessoafisica_id",
        "f.id"
      )
      .innerJoin(
        "pessoajuridicas",
        "pessoajuridicas.id",
        "sigpq_funcionario_orgaos.pessoajuridica_id"
      )
      .innerJoin("pessoas as orgao", "orgao.id", "pessoajuridicas.id")
      .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
      .innerJoin("regimes", "regimes.id", "pessoafisicas.regime_id")
      .innerJoin(
        "sigpq_acto_progressaos",
        "sigpq_acto_progressaos.id",
        "sigpq_provimentos.acto_progressao_id"
      )
      .leftJoin("sigpq_funcionario_estados as fe", "fe.pessoafisica_id", "f.id")
      .leftJoin("sigpq_situacao_estados as se", "se.id", "fe.sigpq_situacao_id")
      .leftJoin("sigpq_estados as es", "es.id", "fe.sigpq_estado_id")
      .leftJoin(
        "sigpq_agente_em_excepcaos as agente_excepcao",
        "agente_excepcao.sigpq_funcionario_id",
        "f.id"
      )
      .where("agente_excepcao.eliminado", false);

    if (options.mais_ano) {
      query.whereRaw(`
              CASE
                WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
                   TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) > ${options.mais_ano}
              END
            `);
    }

    if (options.regimeId) {
      query.where("pessoafisicas.regime_id", options.regimeId);
    }
    if (options.mais_ano) {
      query.whereRaw(`
                CASE
                  WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
                     TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) >  ${options.mais_ano}
                END
              `);
    }
    if (options.idadeMenos || options.idadeMais) {
      if (options.idadeMenos == options.idadeMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) = ${options.idadeMenos}
                  END
                `);
      } else if (options.idadeMenos < options.idadeMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) >= ${options.idadeMenos} and  TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) <= ${options.idadeMais}
                  END
                `);
      } else if (options.idadeMenos && !options.idadeMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) >= ${options.idadeMenos}
                  END
                `);
      } else if (
        !options.idadeMenos &&
        options.idadeMais &&
        options.idadeMais > 18
      ) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) >= 18 and  TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) <= ${options.idadeMais}
                  END
                `);
      } else if (options.idadeMenos > options.idadeMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(pessoafisicas.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento, CURDATE()) > ${options.idadeMenos}
                  END
                `);
      }
    }
    if (options.anoMenos || options.anoMais) {
      if (options.anoMenos == options.anoMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) = ${options.anoMenos}
                  END
                `);
      } else if (options.anoMenos < options.anoMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos} and TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) <= ${options.anoMais}
                  END
                `);
      } else if (options.anoMenos && !options.anoMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
                  END
                `);
      } else if (!options.anoMenos && options.anoMais && options.anoMais > 18) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= 18 and TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) <= ${options.anoMais}
                  END
                `);
      } else if (options.anoMenos > options.anoMais) {
        query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
                  END
                `);
      }
    }
    if (options.sigpq_acto_progressao_id) {
      query.where(
        "sigpq_acto_progressaos.id",
        options.sigpq_acto_progressao_id
      );
    }
    if (options.user.aceder_todos_agentes) {
      if (options.orgaoId) {
        query.where(
          "sigpq_funcionario_orgaos.pessoajuridica_id",
          options.orgaoId
        );
      }
    } else {
      query.where("sigpq_funcionario_orgaos.pessoajuridica_id", orgao?.id);
    }
    if (options.regimeId) {
      query.where("pessoafisicas.regime_id", Number(options.regimeId));
    }
    if (options.patenteId) {
      query.where("patente_id", Number(options.patenteId));
    }
    if (options.tipoVinculoId) {
      query.where("f.sigpq_tipo_vinculo_id", Number(options.tipoVinculoId));
    }
    if (options.tipoOrgao_id) {
      query.whereLike("pj.orgao_comando_provincial", options.tipoOrgao_id);
    }
    if (options.user?.aceder_todos_agentes) {
      if (options.orgaoId) {
        query.where(
          "sigpq_funcionario_orgaos.pessoajuridica_id",
          options.orgaoId
        );
      }
      if (options.tipoOrgaoId) {
        query.where(
          "pessoajuridicas.tipo_estrutura_organica_sigla",
          options.tipoOrgaoId
        );
      }
    } else {
      query.where(
        "sigpq_funcionario_orgaos.pessoajuridica_id",
        options.orgao?.id
      );
    }
    if (options.genero) {
      query.where("pessoafisicas.genero", options.genero);
    }
    if (options.estadoId) {
      query.where("fe.sigpq_estado_id", options.estadoId);
    }
    if (options.situacaoId) {
      query.where("fe.sigpq_situacao_id", options.situacaoId);
    }
    if (options.forcaPassiva) {
      query.where("fe.sigpq_situacao_id", "<>", options.forcaPassiva);
    }
    if (options.patenteClasse) {
      query.where("patentes.sigpq_tipo_carreira_id", options.patenteClasse);
    }

    if (options.search) {
      query.where("pessoas.nome_completo", "like", `%${options.search}%`);
      query.orWhere("f.nip", "like", `%${options.search}%`);
      query.orWhere("f.numero_agente", "like", `%${options.search}%`);
      query.orWhere("patentes.nome", "like", `%${options.search}%`);
      query.orWhere("patentes.classe", "like", `%${options.search}%`);
      query.orWhere(
        "sigpq_provimentos.ordem_descricao",
        "like",
        `%${options.search}%`
      );
      query.orWhere("regimes.quadro", "like", `%${options.search}%`);
      query.orWhere("pessoajuridicas.sigla", "like", `%${options.search}%`);
      query.orWhere("orgao.nome_completo", "like", `%${options.search}%`);
      query.orWhere(
        "sigpq_acto_progressaos.nome",
        "like",
        `%${options.search}%`
      );
      query.orWhere("patentes.duracao", "like", `%${options.search}%`);
      // query.orWhereRaw(
      //   "concat(pessoas.nome_completo, ' ',pessoafisicas.apelido) like " +
      //     `%${options.search}%`
      // );
    }

    if (options.numero) {
      // query.select('sigpq_tipo_cargos.nome as cargo')
      // query.innerJoin('sigpq_cargos', 'sigpq_cargos.pessoafisica_id', 'f.id')
      // query.leftJoin('sigpq_tipo_cargos', 'sigpq_tipo_cargos.id', 'sigpq_cargos.sigpq_tipo_cargo_id')
      // query.where('sigpq_cargos.situacao', 'actual')
      query.where("sigpq_provimentos.ordem_descricao", options.numero);
    }

    if (options.pessoaId && options.numero) {
      query
        .where("f.id", options.pessoaId)
        .where("sigpq_provimentos.ordem_descricao", options.numero);
    }

    return query;
  }

  public async listarTodos(options: any): Promise<any> {
    const orgao = await this.#orgRepo.findOrgaoDaPessoa(
      options.user?.pessoas_id
    );
    const orgaoFuncionario: { [key: string]: any[] } = {};

    function adicionarParaOrgao(key: string, value: object) {
      if (!orgaoFuncionario[key]) {
        orgaoFuncionario[key] = [];
      }

      orgaoFuncionario[key].push(value);
    }
    try {
      const emTempo: DatabaseQueryBuilderContract = this.listarEmTempo(
        options,
        orgao
      );
      const exceptos: DatabaseQueryBuilderContract = this.listarExceptos(
        options,
        orgao
      );

      const query = emTempo
        .unionAll(exceptos) // .where('sigpq_funcionario_orgaos.activo', true)
        .where("pessoas.eliminado", false)
        // .where('pessoafisicas.estado', 'activo')
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.situacao", "actual")
        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false)
        .where("se.nome", "efectividade")
        .orderBy("acto_duracao", "asc");

      if (options.page) {
        const pagination = await query.paginate(
          options.page,
          options.perPage || 10
        );

        pagination["rows"] = await Promise.all(
          pagination["rows"].map(async (item: any) => {
            const cargo = await this.buscarCargoPorPessoa(item?.id);
            const patentePassado = await this.patentePassado(item?.id);

            /* console.log(item) */

            if (patentePassado instanceof Error) {
              return Error(patentePassado.message);
            }

            if (cargo instanceof Error) {
              return Error(cargo.message);
            }

            item.cargo = cargo;
            item.patentePassado = patentePassado;

            adicionarParaOrgao(item?.orgao, item);

            if (Number(item?.duracao) > Number(item?.acto_duracao)) {
              item.cor = "rgb(254, 176, 25)";
            }

            return {
              ...item,
              orgaos: orgaoFuncionario,
            };
          })
        );

        return pagination;
      } else {
        const items = await query;

        const all = await Promise.all(
          items.map(async (item: any) => {
            const cargo = await this.buscarCargoPorPessoa(item?.id);
            const patentePassado = await this.patentePassado(item?.id);

            if (patentePassado instanceof Error) {
              return Error(patentePassado.message);
            }

            if (cargo instanceof Error) {
              return Error(cargo.message);
            }

            item.cargo = cargo;
            item.patentePassado = patentePassado;

            adicionarParaOrgao(item?.orgao, item);

            if (Number(item?.duracao) > Number(item?.acto_duracao)) {
              item.cor = "rgb(254, 176, 25)";
            }
            return {
              ...item,
              orgaos: orgaoFuncionario,
            };
          })
        );

        return all;
      }
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }

  public async buscarCargoPorPessoa(id: number): Promise<any> {
    if (!id) return null;
    try {
      const sigpq_cargo = await Database.from({ c: "sigpq_cargos" })
        .select(
          "c.id",
          "c.situacao",
          "c.pessoafisica_id",
          "c.pessoajuridica_id",
          "tc.id as sigpq_tipo_cargo_id",
          "tc.nome",
          "c.activo",
          Database.raw(
            "DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("sigpq_tipo_cargos as tc", "tc.id", "c.sigpq_tipo_cargo_id")
        .where("c.pessoafisica_id", id)
        .where("c.activo", true)
        .where("c.situacao", "actual")
        .where("c.eliminado", false)
        .first();

      return await sigpq_cargo;
    } catch (error) {
      console.log(error);
      return Error("Não foi possível listar items");
    }
  }

  public async patentePassado(pessoaId: number): Promise<any> {
    if (!pessoaId) return;
    try {
      let despachos = await Database.from({ pp: "sigpq_provimentos" })
        .select(
          "pp.id",
          "patentes.nome as patente",
          Database.raw(
            "DATE_FORMAT(pp.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(pp.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        // .where('fo.activo', true)
        .where("pp.activo", false)
        .where("pp.eliminado", false)
        .innerJoin("patentes", "patentes.id", "pp.patente_id")
        .innerJoin(
          "sigpq_acto_progressaos",
          "sigpq_acto_progressaos.id",
          "pp.acto_progressao_id"
        )
        .where("pp.pessoa_id", pessoaId)
        .orderBy("pp.id", "desc")
        .first();

      return await despachos;
    } catch (error) {
      console.log(error);
      return Error("Não foi possível listar item");
    }
  }
}
