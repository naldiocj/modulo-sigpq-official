import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";

import OrgaoRepository from "App/Repositories/OrgaoRepository";
import ListarEmTempoRepository from "../../proposta-provimentos/repositories/listar-em-tempo-repositorio";
// import { QueryableBase } from 'mysql2/typings/mysql/lib/protocol/sequences/QueryableBase';

export default class ListarEmTempoProvimentoRepository {
  #orgaoRepo: OrgaoRepository;
  #emTempoProposta: ListarEmTempoRepository;

  constructor() {
    this.#orgaoRepo = new OrgaoRepository();
    this.#emTempoProposta = new ListarEmTempoRepository();
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
          "pessoafisicas.apelido",
          "patentes.nome as patente_nome",
          "patentes.sigpq_tipo_carreira_id as patente_classe",
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
  public async listarTodos(options: any): Promise<any> {
    const orgao = await this.#orgaoRepo.findOrgaoDaPessoa(
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
          "f.id",
          "patentes.id as patente_id",
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
        .leftJoin(
          "sigpq_funcionario_estados as fe",
          "fe.pessoafisica_id",
          "f.id"
        )
        .leftJoin(
          "sigpq_situacao_estados as se",
          "se.id",
          "fe.sigpq_situacao_id"
        )
        .leftJoin("sigpq_estados as es", "es.id", "fe.sigpq_estado_id")
        .where("pessoas.eliminado", false)
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.situacao", "actual")
        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false)
        .where("se.nome", "efectividade")
        .orderBy("ano_acto", "desc")
        .where(function (item: any): void {
          if (options.search) {
            item.where("pessoas.nome_completo", "like", `%${options.search}%`);
            item.orWhere("f.nip", "like", `%${options.search}%`);
            item.orWhere("f.numero_agente", "like", `%${options.search}%`);
            item.orWhere("patentes.nome", "like", `%${options.search}%`);
            item.orWhere(
              "sigpq_provimentos.ordem_descricao",
              "like",
              `%${options.search}%`
            );
            item.orWhere("regimes.quadro", "like", `%${options.search}%`);
            item.orWhere(
              "pessoajuridicas.sigla",
              "like",
              `%${options.search}%`
            );
            item.orWhere("orgao.nome_completo", "like", `%${options.search}%`);
            item.orWhere(
              "sigpq_acto_progressaos.nome",
              "like",
              `%${options.search}%`
            );
            item.orWhere("patentes.duracao", "like", `%${options.search}%`);
            item.orWhereRaw(
              "concat(pessoas.nome_completo, ' ',pessoafisicas.apelido) like ?",
              `%${options.search}%`
            );
          }
        })
        .where((query) => {
          if (options.mais_ano) {
            query.whereRaw(`
              CASE
                WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
                   TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) > ${options.mais_ano}
              END
            `);
          }
        })
        .where((query) => {
          if (options.semTempo) {
            query.whereRaw(`
              CASE
                WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
                   TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) > patentes.duracao
              END
            `);
          }
        })
        .where((query) => {
          if (options.regimeId) {
            query.where("pessoafisicas.regime_id", options.regimeId);
          }
        })
        .where((query) => {
          if (options.mais_ano) {
            query.whereRaw(`
              CASE
                WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
                   TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) < ${options.mais_ano}
              END
            `);
          }
        })
        .where((query: any) => {
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
            } else if (
              !options.anoMenos &&
              options.anoMais &&
              options.anoMais > 18
            ) {
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
        })

        .where((query: any) => {
          if (options.sigpq_acto_progressao_id) {
            query.where(
              "sigpq_acto_progressaos.id",
              options.sigpq_acto_progressao_id
            );
          }
        })
        .where((query) => {
          if (options.user.aceder_todos_agentes) {
            if (options.orgaoId) {
              query.where(
                "sigpq_funcionario_orgaos.pessoajuridica_id",
                options.orgaoId
              );
            }
          } else {
            query.where(
              "sigpq_funcionario_orgaos.pessoajuridica_id",
              orgao?.id
            );
          }
        })

        .where((query: any) => {
          if (options.regimeId) {
            query.where("pessoafisicas.regime_id", Number(options.regimeId));
          }
        })
        .where((query: any) => {
          if (options.patenteId) {
            query.where("patentes.id", Number(options.patenteId));
          }
        })
        .where((query: any) => {
          if (options.tipoVinculoId) {
            query.where(
              "f.sigpq_tipo_vinculo_id",
              Number(options.tipoVinculoId)
            );
          }
        })
        .where((query: any) => {
          if (options.tipoOrgao_id) {
            query.whereLike(
              "pj.orgao_comando_provincial",
              options.tipoOrgao_id
            );
          }
        })
        .where((query: any) => {
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
        })
        .where((query: any) => {
          if (options.genero) {
            query.where("pessoafisicas.genero", options.genero);
          }
        })

        .where((query: any) => {
          if (options.estadoId) {
            query.where("fe.sigpq_estado_id", options.estadoId);
          }
        })
        .where((query: any) => {
          if (options.situacaoId) {
            query.where("fe.sigpq_situacao_id", options.situacaoId);
          }
        })

        .where((query: any) => {
          if (options.forcaPassiva) {
            query.where("fe.sigpq_situacao_id", "<>", options.forcaPassiva);
          }
        })

        .where((query: any) => {
          if (options.patenteClasse) {
            query.where(
              "patentes.sigpq_tipo_carreira_id",
              options.patenteClasse
            );
          }
        });

      if (options.numero) {
        query.where("sigpq_provimentos.ordem_descricao", options.numero);
      }
      if (options.pessoaId && options.numero) {
        query
          .where("f.id", options.pessoaId)
          .where("sigpq_provimentos.ordem_descricao", options.numero);
      }

      if (options.page) {
        const pagination = await query.paginate(
          options.page,
          options.perPage || 10
        );

        pagination["rows"] = await Promise.all(
          pagination["rows"].map(async (item: any) => {
            const cargo = await this.#emTempoProposta.buscarCargoPorPessoa(
              item?.id
            );
            const patentePassado = await this.#emTempoProposta.patentePassado(
              item?.id
            );

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
            const cargo = await this.#emTempoProposta.buscarCargoPorPessoa(
              item?.id
            );
            const patentePassado = await this.#emTempoProposta.patentePassado(
              item?.id
            );

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
      console.log(e, "aqui");
      return Error("Não foi possível listar os registos.");
    }
  }
}
