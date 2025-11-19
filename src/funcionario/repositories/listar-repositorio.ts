import Database from "@ioc:Adonis/Lucid/Database";
import { funcaoCompoatilhada_isValidString } from "../../../@core/helpers/funcoesCompartilhadas";
import { mysql2 } from "./../../../../config/database/database";
export default class CrudBaseRepository {
  dateTime = new Date();
  #table = "sigpq_funcionarios";

  public async _listarTodos(options: any): Promise<any> {
    try {
      const { page = 1, perPage = 10 } = options;
      const offset = (page - 1) * perPage;

      const query = mysql2
        .from("sigpq_funcionarios as f")
        .select(
          mysql2.raw("upper(p.nome_completo) as nome_completo"),
          "p.activo",
          "pj.sigla",
          mysql2.raw("upper(pf.apelido) as apelido"),
          "pf.genero",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.id",
          "fe.duracao_inatividade",
          "fe.sigpq_estado_id",
          "fe.sigpq_situacao_id",
          "fe.sigpq_estado_reforma_id",
          "situacao_estado.nome as nome_fora_atividade",
          "es.nome as motivo_desistencia",
          "regimes.quadro",
          mysql2.raw("upper(se.nome) as estado"),
          "patentes.nome as patente_nome",
          mysql2.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          mysql2.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          mysql2.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          ),
          mysql2.raw(
            "DATE_FORMAT(fe.data_inicio_inatividade, '%d/%m/%Y %H:%i:%s') as data_inicio_inatividade"
          ),
          mysql2.raw("COUNT(*) OVER() as total")
        )
        .innerJoin("pessoas as p", "p.id", "f.id")
        .innerJoin("pessoafisicas as pf", "pf.id", "f.id")
        .innerJoin("sigpq_provimentos", "sigpq_provimentos.pessoa_id", "p.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin(
          "sigpq_funcionario_orgaos",
          "sigpq_funcionario_orgaos.pessoafisica_id",
          "p.id"
        )
        .innerJoin(
          "pessoajuridicas as pj",
          "pj.id",
          "sigpq_funcionario_orgaos.pessoajuridica_id"
        )
        .innerJoin("regimes", "regimes.id", "pf.regime_id")
        .innerJoin(
          "sigpq_funcionario_estados as fe",
          "fe.pessoafisica_id",
          "f.id"
        )
        .innerJoin(
          "sigpq_situacao_estados as se",
          "se.id",
          "fe.sigpq_situacao_id"
        )
        .leftJoin(
          "sigpq_estados as situacao_estado",
          "situacao_estado.id",
          "fe.sigpq_estado_id"
        )
        .leftJoin("sigpq_estados as es", "es.id", "fe.sigpq_estado_reforma_id")
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false)
        .where("sigpq_funcionario_orgaos.nivel_colocacao", "muito-alto")
        .where("p.eliminado", false)
        .offset(offset)
        .limit(perPage);

      this.aplicarFiltros(query, options);
      const result = await query;

      const total = result.length > 0 ? result[0].total : 0;
      const lastPage = Math.ceil(total / perPage);

      return {
        data: result,
        meta: {
          total: total,
          per_page: perPage,
          current_page: page,
          last_page: lastPage,
          first_page: 1,
          first_page_url: `/?page=1`,
          last_page_url: `/?page=${lastPage}`,
          next_page_url: page < lastPage ? `/?page=${page + 1}` : null,
          previous_page_url: page > 1 ? `/?page=${page - 1}` : null,
        },
      };
    } catch (error) {
      console.error(error);
      throw new Error("Não foi possível listar os registros.");
    }
  }

  public async listarTodos(options: any): Promise<any> {
    const trx = await Database.transaction();

    try {
      const query = this.construirQueryBase(trx);

      this.aplicarFiltros(query, options);

      if (options.page) {
        const pagination: any = await query.paginate(
          options.page,
          options.perPage || 10
        );
        pagination.rows = await this.enriquecerDados(pagination.rows, trx);
        await trx.commit();
        return pagination;
      } else {
        const items = await query;
        const enrichedItems = await this.enriquecerDados(items, trx);
        await trx.commit();
        return enrichedItems;
      }
    } catch (error) {
      await trx.rollback();
      console.error(error);
      throw new Error("Não foi possível listar os registos.");
    }
  }

  private construirQueryBase(trx: any) {
    return (
      Database.from({ f: "sigpq_funcionarios" })
        .useTransaction(trx)
        ///.distinct('f.id')
        .select(
          Database.raw("upper(p.nome_completo) as nome_completo"),
          "p.activo",
          "pj.sigla",
          Database.raw("upper(pf.apelido) as apelido"),
          "pf.genero",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.id",
          "fe.duracao_inatividade",
          "fe.sigpq_estado_id",
          "fe.sigpq_situacao_id",
          "fe.sigpq_estado_reforma_id",
          "situacao_estado.nome as nome_fora_atividade",
          "es.nome as motivo_desistencia",
          "regimes.quadro",
          Database.raw("upper(se.nome) as estado"),
          "patentes.nome as patente_nome",
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          ),
          Database.raw(
            "DATE_FORMAT(fe.data_inicio_inatividade, '%d/%m/%Y %H:%i:%s') as data_inicio_inatividade"
          )
        )
        .innerJoin("pessoas as p", "p.id", "f.id")
        .innerJoin("pessoafisicas as pf", "pf.id", "f.id")
        .innerJoin("sigpq_provimentos", "sigpq_provimentos.pessoa_id", "p.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin(
          "sigpq_funcionario_orgaos",
          "sigpq_funcionario_orgaos.pessoafisica_id",
          "p.id"
        )
        .innerJoin(
          "pessoajuridicas as pj",
          "pj.id",
          "sigpq_funcionario_orgaos.pessoajuridica_id"
        )
        .innerJoin("regimes", "regimes.id", "pf.regime_id")
        .innerJoin(
          "sigpq_funcionario_estados as fe",
          "fe.pessoafisica_id",
          "f.id"
        )
        .innerJoin(
          "sigpq_situacao_estados as se",
          "se.id",
          "fe.sigpq_situacao_id"
        )
        .leftJoin(
          "sigpq_estados as situacao_estado",
          "situacao_estado.id",
          "fe.sigpq_estado_id"
        )
        .leftJoin("sigpq_estados as es", "es.id", "fe.sigpq_estado_reforma_id")
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false)
        .where("sigpq_funcionario_orgaos.nivel_colocacao", "muito-alto")
        .where("p.eliminado", false)
    );
    // .orderBy("p.updated_at", "desc")
    // .orderBy('p.nome_completo', 'asc');
  }

  private aplicarFiltros(query: any, options: any) {
    if (options.idadeMenos || options.idadeMais) {
      this.filtrarPorIdade(query, options);
    }

    if (options.anoMenos || options.anoMais) {
      this.filtrarPorAno(query, options);
    }

    if (options.regimeId) {
      query.where("pf.regime_id", Number(options.regimeId));
    }

    if (options.patenteId) {
      query.where("patentes.id", Number(options.patenteId));
    }

    if (options.tipoVinculoId) {
      query.where("f.sigpq_tipo_vinculo_id", Number(options.tipoVinculoId));
    }

    if (options.sigpq_estado_reforma_id) {
      query.where(
        "fe.sigpq_estado_reforma_id",
        Number(options.sigpq_estado_reforma_id)
      );
    }

    if (options.tipoOrgao_id) {
      query.whereLike("pj.orgao_comando_provincial", options.tipoOrgao_id);
    }

    if (options.aceder_todos_agentes) {
      if (options.orgaoId) {
        query.where(
          "sigpq_funcionario_orgaos.pessoajuridica_id",
          options.orgaoId
        );
      }
      if (options.tipoOrgaoId) {
        query.where("pj.tipo_estrutura_organica_sigla", options.tipoOrgaoId);
      }
    } else {
      if (options.aceder_departamento) {
        query
          .innerJoin(
            "sigpq_funcionario_orgaos as orgao",
            "orgao.pessoafisica_id",
            "p.id"
          )
          .where("orgao.nivel_colocacao", "alto")
          .where("orgao.pessoajuridica_id", options.sigpq_tipo_departamento.id);
      } else if (options.aceder_seccao) {
        query
          .innerJoin(
            "sigpq_funcionario_orgaos as orgao",
            "orgao.pessoafisica_id",
            "p.id"
          )
          .where("orgao.nivel_colocacao", "medio")
          .where("orgao.pessoajuridica_id", options.sigpq_tipo_seccao.id);
      } else if (options.aceder_posto_policial) {
        query
          .innerJoin(
            "sigpq_funcionario_orgaos as orgao",
            "orgao.pessoafisica_id",
            "p.id"
          )
          .where("orgao.nivel_colocacao", "baixo")
          .where("orgao.pessoajuridica_id", options.sigpq_tipo_posto.id);
      } else {
        query.where(
          "sigpq_funcionario_orgaos.pessoajuridica_id",
          options.orgao?.id
        );
      }
    }

    if (options.genero) {
      query.where("pf.genero", options.genero);
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

    if (options.dashboard && options.patenteClasse) {
      query.where("patentes.sigpq_tipo_carreira_id", options.patenteClasse);
    }

    if (options.search) {
      this.filtrarPorSearch(query, options.search);
    }

    if (options.funcao_id) {
      query
        .innerJoin("sigpq_cargos as cargo", "cargo.pessoafisica_id", "f.id")
        .where("cargo.sigpq_tipo_cargo_id", options.funcao_id)
        .orderBy("f.data_adesao", "asc");
    }

    if (
      options.situacaoId == 5 &&
      options.sigpq_excluir_estado_reforma_id &&
      !options.estadoId
    ) {
      query.whereNotIn(
        "fe.sigpq_estado_reforma_id",
        options.sigpq_excluir_estado_reforma_id
      );
    }

    if (options.excluir_efectividade_e_inactividade) {
      query.whereNotIn(
        "fe.sigpq_situacao_id",
        options.excluir_efectividade_e_inactividade
      );
    }

    if (!options.orderby) {
      //query.orderBy('p.updated_at', 'desc')
      query.orderBy('nome_completo', 'asc')
    } 
    else if (options.orderby == "PATENTE") query.orderBy("patentes.id", "asc");
    else if (options.orderby == "NIP") query.orderBy("f.nip", "asc");
    else if (options.orderby == "NOME") query.orderBy("nome_completo", "asc");
  }

  private filtrarPorIdade(query: any, options: any) {
    if (options.idadeMenos == options.idadeMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) = ${options.idadeMenos}
         END`
      );
    } else if (options.idadeMenos < options.idadeMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) BETWEEN ${options.idadeMenos} AND ${options.idadeMais}
         END`
      );
    } else if (options.idadeMenos && !options.idadeMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMenos}
         END`
      );
    } else if (
      !options.idadeMenos &&
      options.idadeMais &&
      options.idadeMais > 18
    ) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) BETWEEN 18 AND ${options.idadeMais}
         END`
      );
    } else if (options.idadeMenos > options.idadeMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(pf.data_nascimento) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMenos}
         END`
      );
    }
  }

  private filtrarPorAno(query: any, options: any) {
    if (options.anoMenos == options.anoMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) = ${options.anoMenos}
         END`
      );
    } else if (options.anoMenos < options.anoMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) BETWEEN ${options.anoMenos} AND ${options.anoMais}
         END`
      );
    } else if (options.anoMenos && !options.anoMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
         END`
      );
    } else if (!options.anoMenos && options.anoMais && options.anoMais > 18) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) BETWEEN 18 AND ${options.anoMais}
         END`
      );
    } else if (options.anoMenos > options.anoMais) {
      query.whereRaw(
        `CASE
           WHEN DATE(f.data_adesao) < CURDATE() THEN
              TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
         END`
      );
    }
  }

  private filtrarPorSearch(query: any, search: string) {
    query.where((item: any) => {
      item.orWhere("p.nome_completo", "like", `%${search}%`);
      item.orWhere("pf.apelido", "like", `%${search}%`);
      item.orWhere("se.nome", "like", `%${search}%`);
      item.orWhere("f.nip", "like", `%${search}%`);
      item.orWhere("f.numero_processo", "like", `%${search}%`);
      item.orWhere("f.numero_agente", "like", `%${search}%`);
      item.orWhereRaw(
        "concat(p.nome_completo, ' ', pf.apelido) like ?",
        `%${search}%`
      );

      const date = new Date(search);
      if (!isNaN(date.getTime())) {
        const [day, month, year] = search.split("/");
        let data = "";
        if (day && month && year) {
          data = `${year}-${month}-${day}`;
        } else if (day && month) {
          data = `${month}-${day}`;
        } else {
          data = day;
        }
        item.orWhere("p.created_at", "like", `%${data}%`);
      }
    });
  }

  private async enriquecerDados(items: any[], trx: any = null) {
    return Promise.all(
      items.map(async (item) => {
        const documento = await Database.from({ f: "sigpq_documentos" })
          .useTransaction(trx)
          .select("id", "nid", "data_emissao", "data_expira")
          .whereNotIn("f.nid", ["Pessoal", "Profissional"])
          .where("f.pessoafisica_id", item?.id)
          .where("f.eliminado", false)
          .first();

        const orgao = await this.acharOrgao_do_agente(item?.id, trx);

        return {
          ...item,
          orgao: item?.id ? orgao : null,
          documento,
        };
      })
    );
  }

  public async acharOrgao_do_agente(
    agente_id: string,
    trx: any = null
  ): Promise<any> {
    if (!funcaoCompoatilhada_isValidString(agente_id)) return null;
    return await Database.from({ orgao_table: "sigpq_funcionario_orgaos" })
      .useTransaction(trx)
      .select(
        "p_aux.id",
        Database.raw("upper(p_aux.nome_completo) as nome"),
        Database.raw("upper(pd_aux.nome_completo) as nome_passado"),
        "p_aux.user_id",
        "p_aux.activo",
        "pj_aux.sigla",
        "pdf_aux.sigla as sigla_passado",
        "pdf_aux.descricao",
        Database.raw(
          "DATE_FORMAT(p_aux.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"
        ),
        Database.raw(
          "DATE_FORMAT(p_aux.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt"
        )
      )
      .innerJoin(
        "sigpq_funcionario_orgaos as orgao",
        "orgao_table.pessoafisica_id",
        agente_id
      )
      .innerJoin(
        "pessoajuridicas as pj_aux",
        "pj_aux.id",
        "orgao_table.pessoajuridica_id"
      )
      .innerJoin("pessoas as p_aux", "p_aux.id", "pj_aux.id")
      .leftJoin(
        "pessoas as pd_aux",
        "pd_aux.id",
        "orgao_table.pessoajuridica_passado_id"
      )
      .leftJoin("pessoajuridicas as pdf_aux", "pdf_aux.id", "pd_aux.id")
      .where("p_aux.eliminado", false)
      .where("pj_aux.tipo_pessoajuridica_id", 1)
      .where("orgao_table.pessoafisica_id", agente_id)
      .where("orgao_table.eliminado", false)
      .where("orgao_table.activo", true)
      .first();
  }

  public async buscarNip(n: any, pessoaId: any = null) {
    return n
      ? await Database.from({ f: this.#table })
          .join("pessoas as p", "p.id", "f.id")
          .join("sigpq_funcionario_orgaos as fo", "fo.pessoafisica_id", "f.id")
          .where("f.nip", n)
          .where("fo.eliminado", false)
          .where("p.eliminado", false)
          .where((query) => {
            if (pessoaId) {
              query.where("f.id", "<>", pessoaId);
            }
          })
          .first()
      : null;
  }

  public async buscarAgentePoNumero(n: any, pessoaId: any = null) {
    return n
      ? await Database.from({ f: this.#table })
          .join("pessoas as p", "p.id", "f.id")
          .join("sigpq_funcionario_orgaos as fo", "fo.pessoafisica_id", "f.id")
          .where("f.numero_agente", n)
          .where("fo.eliminado", false)
          .where("p.eliminado", false)
          .where((query) => {
            if (pessoaId) {
              query.where("f.id", "<>", pessoaId);
            }
          })
          .first()
      : null;
  }

  public async buscarNPS(n: any, pessoaId: any = null) {
    return n
      ? await Database.from({ f: this.#table })
          .join("pessoas as p", "p.id", "f.id")
          .join("sigpq_funcionario_orgaos as fo", "fo.pessoafisica_id", "f.id")
          .where("f.nps", n)
          .where("fo.eliminado", false)
          .where("p.eliminado", false)
          .where((query) => {
            if (pessoaId) {
              query.where("f.id", "<>", pessoaId);
            }
          })
          .first()
      : null;
  }
}
