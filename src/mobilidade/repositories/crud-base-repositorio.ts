import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";
import NumeroAutomaticoService from "App/@piips/shared/service/NumeroAutomaticoService";
import CrudDocumentoBaseRepository from "../../documento/repositories/crud-base-repositorio";
const {
  uploadFile,
  deleteFileUrl,
} = require("App/@piips/shared/metodo-generico/Upload-Or-Read-File");
const mapearCampos = require("App/@piips/shared/metodo-generico/MapearCampos");
const {
  extensao_ordem,
  extensao_despacho,
} = require("App/@piips/shared/metodo-generico/Buscar-Data-Extensao");

const cores = {
  P: {
    nome: "rgb(254, 176, 25)",
  },
  EX: {
    nome: "red",
  },
  V: {
    nome: "rgb(0, 143, 251)",
  },
};

export const estado = (key: string): string => {
  const estados: any = {
    P: {
      estado: "Pendente",
    },
    V: {
      estado: "Visto",
    },
    EX: {
      estado: "Expirado",
    },
  };

  return estados.hasOwnProperty(key) ? estados[key].estado : null;
};

export default class CrudBaseRepository extends BaseModuloRepository {
  #numeroAutomaticoService: NumeroAutomaticoService;
  public numeroAutomatico: any;
  #crudDocumentoBaseRepository;

  constructor() {
    super("sigpq_funcionario_orgaos");
    this.#numeroAutomaticoService = new NumeroAutomaticoService();
    this.#crudDocumentoBaseRepository = new CrudDocumentoBaseRepository();
  }

  public async registar(input: any, file: any, trxParam = null): Promise<any> {
    let validate = [];
    try {
      const camposDesejados: (keyof any)[] = [
        "orgao_destino_id",
        "direccao_destino_id",
        "user_id",
        "agentes_id",
        // "anexo",
        "despacho",
        "data_ingresso",
        // "ordenante",
        // "numero_ordem",
        "pessoajuridica_passado_id",
        "departamentoPassadoId",
        "departamento_id",
        // "seccao",
        // "brigada",
        // "data_ordem",
        "numero_guia",
        "despacho_data",
        "situacao",
      ];

      const camposOpcionais: (keyof any)[] = ["observacao"];

      validate = mapearCampos(input, camposDesejados, camposOpcionais);
    } catch (error) {
      console.log(error.message);
      return Error(error.message);
    }

    let fileGuiaPath: any = "";

    const trx = await Database.transaction();
    try {
      this.numeroAutomatico =
        await this.#numeroAutomaticoService.gerarNumeroAutomatico(
          "Numero_guia"
        );
      const agentes = input.agentes_id?.toString()?.split(",");

      const pf = await this.buscarPessoaPorUserId(input?.user_id);
      const pessoa_id = pf.pessoa_id;

      const fileGuia = file.file("anexo");
      fileGuiaPath = fileGuia
        ? await uploadFile(pessoa_id + "/individual", fileGuia)
        : null;

      const passaporte = {
        anexo: fileGuiaPath,
        nid: "Profissional",
        pessoafisica_id: pessoa_id,
        user_id: input.user_id,
        sigpq_tipo_documento_id: 21,
      };

      const resultadoPassaporte =
        await this.#crudDocumentoBaseRepository.registar(passaporte, trx);

      if (resultadoPassaporte instanceof Error) {
        return resultadoPassaporte;
      }
      let guiaAntiga: any = "";

      if (
        input.situacao == "actual" ||
        input.situacao == "anterior" // && agentes?.length > 0
      ) {
        for (const agente of agentes) {
          const pjp: any = await this.buscarOrgaoAnterior(agente, "muito-alto");
          const pjd_id = input?.pessoajuridica_passado_id
            ? input?.pessoajuridica_passado_id
            : pjp?.pessoajudidica_id_passado;

          const dp: any = await this.buscarOrgaoAnterior(agente, "alto");
          const dpp_id = input?.departamentoPassadoId
            ? input?.departamentoPassadoId
            : dp?.pessoajudidica_id_passado;

          // const ud: any = await this.buscarOrgaoAnterior(agente, 'moderado')
          // const udp_id = input?.unidadePassadoId ? input?.unidadePassadoId : ud?.pessoajudidica_id_passado

          // const sc: any = await this.buscarOrgaoAnterior(agente, "medio");
          // const sc_id = input?.seccaoPassadoId
          //   ? input?.seccaoPassadoId
          //   : sc?.pessoajudidica_id_passado;

          const posto: any = await this.buscarOrgaoAnterior(agente, "baixo");
          const posto_id = input?.postoPassadoId
            ? input?.postoPassadoId
            : posto?.pessoajudidica_id_passado;

          // const guia = await this.getNumeroGuia(
          //   input.pessoajuridica_id,
          //   pjd_id
          // );

          const guia = input.numero_guia;

          // if (guia instanceof Error) return Error(guia.message);

          delete validate["departamentoPassadoId"];
          delete validate["departamento_id"];
          delete validate["orgao_destino_id"];
          delete validate["direccao_destino_id"];

          const mobilidade = {
            ...validate,
            // ordem_data: input?.data_ordem,
            // ordem_descricao: extensao_ordem(input?.data_ordem, input?.numero_ordem),
            despacho_descricao: input?.despacho
              ? extensao_despacho(input?.despacho_data, input?.despacho)
              : null,
            despacho_data: input?.despacho_data,
            pessoajuridica_passado_id: pjd_id,
            pessoajuridica_id: input?.direccao_destino_id,
            pessoafisica_id: agente,
            sigpq_documento_anexo_id: resultadoPassaporte[0],

            numero_guia: guia,
            nivel_colocacao: "muito-alto",
            // anexo_ordem: fileGuiaPath,
            activo: input.situacao == "anterior" ? 0 : 1,
            created_at: this.dateTime,
            updated_at: this.dateTime,
          };

          // console.log(mobilidade)

          delete mobilidade["agentes_id"];
          delete mobilidade["ordenante"];
          if (this.isActual(input?.situacao)) {
            await Database.from("sigpq_funcionario_orgaos")
              .useTransaction(trx)
              .where("pessoafisica_id", agente)
              .where("activo", true)
              .where("nivel_colocacao", "muito-alto")
              // .where('situacao', 'actual')
              .where("eliminado", false)
              .update({ activo: false, situacao: "anterior" });
          }

          const mobilidadeId = await Database.table("sigpq_funcionario_orgaos")
            .useTransaction(trx)
            .insert(mobilidade);

          const maisMobilidade = {
            ordenante: input?.ordenante,
            sigpq_fun_id: mobilidadeId[0],
            pessoafisica_id: pessoa_id,
            user_id: input?.user_id,
            created_at: this.dateTime,
            updated_at: this.dateTime,
          };
          if (guiaAntiga != guia) {
            const cor = cores["P"].nome;
            const tratamentoInput = {
              cor: cor,
              numero_guia: guia,
              user_id: input?.user_id,
              activo: true || 1,
              pessoafisica_id: pessoa_id,
              created_at: this.dateTime,
              updated_at: this.dateTime,
            };

            await Database.insertQuery()
              .useTransaction(trx)
              .table("sigpq_tratamento_mobilidades")
              .insert(tratamentoInput);
          }

          await Database.insertQuery()
            .useTransaction(trx)
            .table("sigpq_mais_mobilidades")
            .insert(maisMobilidade);
          guiaAntiga = guia;

          if (input?.departamento_id) {
            const mobilidade = {
              ...validate,
              pessoajuridica_id: input?.departamento_id,
              // ordem_data: input?.data_ordem,
              // ordem_descricao: extensao_ordem(input?.data_ordem, input?.numero_ordem),
              despacho_descricao: input?.despacho
                ? extensao_despacho(input?.despacho_data, input?.despacho)
                : null,
              despacho_data: input?.despacho_data,
              pessoajuridica_passado_id: dpp_id,
              pessoafisica_id: agente,
              sigpq_documento_anexo_id: resultadoPassaporte[0],
              numero_guia: guia,
              nivel_colocacao: "alto",
              // anexo_ordem: fileGuiaPath,
              activo: input.situacao == "anterior" ? 0 : 1,
              created_at: this.dateTime,
              updated_at: this.dateTime,
            };

            delete mobilidade["agentes_id"];
            delete mobilidade["pessoajuridica_id"];
            delete mobilidade["ordenante"];
            if (this.isActual(input?.situacao)) {
              await Database.from("sigpq_funcionario_orgaos")
                .useTransaction(trx)
                .where("pessoafisica_id", agente)
                .where("activo", true)
                .where("nivel_colocacao", "alto")
                .where("situacao", "actual")
                .where("eliminado", false)
                .update({ activo: false, situacao: "anterior" });
            }

            const mobilidadeId = await Database.table(
              "sigpq_funcionario_orgaos"
            )
              .useTransaction(trx)
              .insert(mobilidade);

            const maisMobilidade = {
              ordenante: input?.ordenante,
              sigpq_fun_id: mobilidadeId[0],
              pessoafisica_id: pessoa_id,
              user_id: input?.user_id,
              created_at: this.dateTime,
              updated_at: this.dateTime,
            };
            if (guiaAntiga != guia) {
              const cor = cores["P"].nome;
              const tratamentoInput = {
                cor: cor,
                numero_guia: guia,
                user_id: input?.user_id,
                activo: true || 1,
                pessoafisica_id: pessoa_id,
                created_at: this.dateTime,
                updated_at: this.dateTime,
              };

              await Database.insertQuery()
                .useTransaction(trx)
                .table("sigpq_tratamento_mobilidades")
                .insert(tratamentoInput);
            }

            await Database.insertQuery()
              .useTransaction(trx)
              .table("sigpq_mais_mobilidades")
              .insert(maisMobilidade);
            // guiaAntiga = guia;
          }

          if (input?.seccao_id) {
            const mobilidade = {
              ...validate,
              pessoajuridica_id: input?.seccao_id,
              // ordem_data: input?.data_ordem,
              // ordem_descricao: extensao_ordem(input?.data_ordem, input?.numero_ordem),
              despacho_descricao: input?.despacho
                ? extensao_despacho(input?.despacho_data, input?.despacho)
                : null,
              despacho_data: input?.despacho_data,
              // pessoajuridica_passado_id: sc_id,
              pessoafisica_id: agente,
              sigpq_documento_anexo_id: resultadoPassaporte[0],
              numero_guia: guia,
              nivel_colocacao: "medio",
              // anexo_ordem: fileGuiaPath,
              activo: input.situacao == "anterior" ? 0 : 1,
              created_at: this.dateTime,
              updated_at: this.dateTime,
            };

            delete mobilidade["agentes_id"];
            delete mobilidade["pessoajuridica_id"];
            delete mobilidade["ordenante"];
            if (this.isActual(input?.situacao)) {
              await Database.from("sigpq_funcionario_orgaos")
                .useTransaction(trx)
                .where("pessoafisica_id", agente)
                .where("activo", true)
                .where("nivel_colocacao", "medio")
                .where("situacao", "actual")
                .where("eliminado", false)
                .update({ activo: false, situacao: "anterior" });
            }

            const mobilidadeId = await Database.table(
              "sigpq_funcionario_orgaos"
            )
              .useTransaction(trx)
              .insert(mobilidade);

            const maisMobilidade = {
              ordenante: input?.ordenante,
              sigpq_fun_id: mobilidadeId[0],
              pessoafisica_id: pessoa_id,
              user_id: input?.user_id,
              created_at: this.dateTime,
              updated_at: this.dateTime,
            };
            if (guiaAntiga != guia) {
              const cor = cores["P"].nome;
              const tratamentoInput = {
                cor: cor,
                numero_guia: guia,
                user_id: input?.user_id,
                activo: true || 1,
                pessoafisica_id: pessoa_id,
                created_at: this.dateTime,
                updated_at: this.dateTime,
              };

              await Database.insertQuery()
                .useTransaction(trx)
                .table("sigpq_tratamento_mobilidades")
                .insert(tratamentoInput);
            }

            await Database.insertQuery()
              .useTransaction(trx)
              .table("sigpq_mais_mobilidades")
              .insert(maisMobilidade);
            guiaAntiga = guia;
          }
          if (input?.posto_id) {
            const mobilidade = {
              ...validate,
              pessoajuridica_id: input?.posto_id,
              // ordem_data: input?.data_ordem,
              // ordem_descricao: extensao_ordem(input?.data_ordem, input?.numero_ordem),
              despacho_descricao: input?.despacho
                ? extensao_despacho(input?.despacho_data, input?.despacho)
                : null,
              despacho_data: input?.despacho_data,
              pessoajuridica_passado_id: posto_id,
              pessoafisica_id: agente,
              sigpq_documento_anexo_id: resultadoPassaporte[0],
              numero_guia: guia,
              nivel_colocacao: "baixo",
              // anexo_ordem: fileGuiaPath,
              activo: input.situacao == "anterior" ? 0 : 1,
              created_at: this.dateTime,
              updated_at: this.dateTime,
            };

            delete mobilidade["agentes_id"];
            delete mobilidade["pessoajuridica_id"];
            delete mobilidade["ordenante"];
            if (this.isActual(input?.situacao)) {
              await Database.from("sigpq_funcionario_orgaos")
                .useTransaction(trx)
                .where("pessoafisica_id", agente)
                .where("activo", true)
                .where("nivel_colocacao", "baixo")
                .where("situacao", "actual")
                .where("eliminado", false)
                .update({ activo: false, situacao: "anterior" });
            }

            const mobilidadeId = await Database.table(
              "sigpq_funcionario_orgaos"
            )
              .useTransaction(trx)
              .insert(mobilidade);

            const maisMobilidade = {
              ordenante: input?.ordenante,
              sigpq_fun_id: mobilidadeId[0],
              pessoafisica_id: pessoa_id,
              user_id: input?.user_id,
              created_at: this.dateTime,
              updated_at: this.dateTime,
            };
            if (guiaAntiga != guia) {
              const cor = cores["P"].nome;
              const tratamentoInput = {
                cor: cor,
                numero_guia: guia,
                user_id: input?.user_id,
                activo: true || 1,
                pessoafisica_id: pessoa_id,
                created_at: this.dateTime,
                updated_at: this.dateTime,
              };

              await Database.insertQuery()
                .useTransaction(trx)
                .table("sigpq_tratamento_mobilidades")
                .insert(tratamentoInput);
            }

            await Database.insertQuery()
              .useTransaction(trx)
              .table("sigpq_mais_mobilidades")
              .insert(maisMobilidade);
            guiaAntiga = guia;
          }
        }
      }
      return trxParam ? trxParam : await trx.commit();
    } catch (e) {
      trxParam ? trxParam : await trx.rollback();
      console.log(e);
      // await deleteFileUrl(fileGuiaPath)
      throw new Error("Não foi possível criar um novo registo.");
    }
  }

  private isActual(situacao: string) {
    return ["actual"].includes(situacao.toLowerCase()) ? true : false;
  }

  public async editarData(
    input: any,
    id: number,
    trx: any = null
  ): Promise<any> {
    trx = trx ?? (await Database.transaction());
    const data = new Date(input.guia_data);
    const numero_guia_aux = input.numero_guia.split("/") || [];
    const numero_guia = `${numero_guia_aux[0]}/${numero_guia_aux[1]}/${
      numero_guia_aux[2]
    }/${data.getFullYear()}`;
    const despacho_aux = input.despacho.split("/") || [];
    const despacho =
      despacho_aux.length > 1
        ? `${input.numero_despacho}/${despacho_aux[1]}`
        : input.numero_despacho;

    const despacho_descricao = `${extensao_despacho(
      input?.despacho_data,
      despacho
    )}`;
    try {
      const sigpq_cargo = {
        despacho_data: new Date(input.despacho_data),
        despacho_descricao: despacho_descricao,
        despacho: despacho,
        numero_guia: numero_guia,
      };
      await Database.from("sigpq_funcionario_orgaos")
        .where("id", id)
        .update(sigpq_cargo)
        .useTransaction(trx);

      return await trx.commit();
    } catch (e) {
      await trx.rollback();
      console.log(e);
      return Error("Não foi possível atualizar Provimento.");
    }
  }

  public async aprovaMobilidade( id: any, trxParam = null
  ): Promise<any> {

    console.log(id)
    const trx = trxParam ? trxParam : await Database.transaction();

    const guiaFinded = await Database.from({ fo: "sigpq_tratamento_mobilidades" })
    .where("numero_guia", id)
    .first();

    if (!guiaFinded) { 
      return Error("Guia não encontrada.");
    } 

    const cor = cores["P"].nome;
    const tratamentoInput = {
      cor: cor,
    };

    await Database.from("sigpq_tratamento_mobilidades")
      .useTransaction(trx)
      .where("numero_guia", id)
      .update(tratamentoInput)
  }

  public async editar(input: any, id: any, trxParam = null): Promise<any> {
    let validate = [];
    try {
      const camposDesejados: (keyof any)[] = [
        "nid",
        "pessoafisica_id",
        "user_id",
      ];

      validate = mapearCampos(input, camposDesejados, [
        "anexo",
        "data_expira",
        "local_emissao",
        "data_emissao",
      ]);
    } catch (error) {
      console.log(error.message);
      return Error(error.message);
    }

    const dateTime = new Date();

    const trx = trxParam ? trxParam : await Database.transaction();

    try {
      const documento = {
        ...validate,
        local_emissao: input?.local_emissao,
        data_emissao: input?.data_emissao,
        data_expira: input?.data_expira,
        updated_at: dateTime,
      };

      await Database.from("sigpq_documentos")
        .useTransaction(trx)
        .where("id", id)
        .where("activo", true)
        .where("eliminado", false)
        .update(documento);

      return trxParam ? trxParam : await trx.commit();
    } catch (e) {
      trxParam ? trxParam : await trx.rollback();
      console.log(e);
      throw new Error("Não foi possível criar um novo registo.");
    }
  }

  public async listarTodos(options: any): Promise<any> {
    try {
      let despachos = Database.from({ fo: "sigpq_funcionario_orgaos" })
        .select(
          // "fo.id",
          "fo.pessoajuridica_id",
          // "fo.pessoafisica_id",
          "fo.user_id",
          "fo.despacho",
          "fo.numero_guia",
          // 'fo.ordem_descricao',
          "fo.despacho_descricao",
          // 'fo.numero_ordem',
          "fo.pessoajuridica_passado_id",
          Database.raw("COUNT(fo.id) as total"),
          Database.raw(
            "DATE_FORMAT(fo.data_ingresso, '%d/%m/%Y') as data_ingresso"
          ),
          Database.raw(
            "DATE_FORMAT(fo.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(fo.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        // .where('fo.activo', true)
        .where("fo.activo", true)
        .where("fo.nivel_colocacao", "muito-alto")
        .where("fo.eliminado", false)
        .innerJoin(
          "pessoajuridicas",
          "pessoajuridicas.id",
          "fo.pessoajuridica_id"
        )
        .innerJoin(
          "pessoajuridicas as passado",
          "passado.id",
          "fo.pessoajuridica_passado_id"
        )
        .innerJoin("pessoas ", "pessoas.id", "pessoajuridicas.id")
        .innerJoin("pessoas as p", "p.id", "passado.id")
        .whereNotNull("fo.despacho")
        .orderBy("fo.updated_at")
        .groupBy([
          "fo.pessoajuridica_id",
          "fo.pessoajuridica_passado_id",
          "fo.despacho_descricao",
          "fo.numero_guia",
          "fo.user_id",
          "fo.despacho",
          "fo.data_ingresso",
          "fo.created_at",
          "fo.updated_at",
        ])
        .where((query) => {
          if (options.search) {
            query.where("fo.despacho", "like", `%${options.search}%`);
            query.orWhere("fo.numero_guia", "like", `%${options.search}%`);
            query.orWhere(
              "pessoajuridicas.sigla",
              "like",
              `%${options.search}%`
            );
            query.orWhere("passado.sigla", "like", `%${options.search}%`);
            query.orWhere(
              "pessoas.nome_completo",
              "like",
              `%${options.search}%`
            );
            query.orWhere("p.nome_completo", "like", `%${options.search}%`);
            // query.orWhere('fo.ordem_descricao', options.search)
            query.orWhere(
              "fo.despacho_descricao",
              "like",
              `%${options.search}%`
            );
            // query.orWhere('fo.numero_ordem', options.search)
          }
        })

        .where((query: any) => {
          if (options?.user?.aceder_todos_agentes) {
            if (options.orgaoId) {
              query.where("pessoajuridicas.id", options.orgaoId);
              query.orWhere("passado.id", options.orgaoId);
            }
            if (options.tipoOrgaoId) {
              query.where(
                "pessoajuridicas.tipo_estrutura_organica_sigla",
                options.tipoOrgaoId
              );
              query.orWhere(
                "passado.tipo_estrutura_organica_sigla",
                options.orgaoId
              );
            }
          } else {
            query.where("pessoajuridicas.id", options.orgao?.id);
            query.orWhere("passado.id", options.orgao?.id);
          }
        });

      if (options.numero_guia) {
        despachos.where("fo.numero_guia", options.numero_guia);
      }

      if (options.page) {
        const pagination = await despachos.paginate(
          options.page,
          options.perPage || 10
        );
        pagination["rows"] = await Promise.all(
          pagination["rows"].map(async (item: any) => {
            const colocacao = await this.buscarColocacao(
              item.pessoajuridica_id
            );
            const colocacao_passado = await this.buscarColocacao(
              item.pessoajuridica_passado_id
            );
            const user = await this.buscarUtilizador(item?.user_id);
            const responsavel = await this.mobilidadeResponsavel(item?.user_id);
            const tratamento: any = await Database.from({
              t: "sigpq_tratamento_mobilidades",
            })
              .select("t.*")
              .where("t.numero_guia", item?.numero_guia)
              .where("t.activo", true)
              .first();

            const agentes: any = await this.agentePorGuia({
              numero_guia: item?.numero_guia,
            });
            delete item.user_id;
            delete item.pessoajuridica_id;

            return {
              ...item,
              agentes,
              pessoajuridica_actual: colocacao,
              pessoajuridica_passado: colocacao_passado,
              user: user,
              tratamento,
              status: estado(tratamento?.estado),
              agente_responsavel: responsavel,
            };
          })
        );

        return pagination;
      } else {
        const items = await despachos;
        const all = await Promise.all(
          items.map(async (item: any) => {
            const colocacao = await this.buscarColocacao(
              item.pessoajuridica_id
            );
            const colocacao_passado = await this.buscarColocacao(
              item.pessoajuridica_passado_id
            );
            const user = await this.buscarUtilizador(item.user_id);
            const responsavel = await this.mobilidadeResponsavel(item?.user_id);
            const tratamento: any = await Database.from({
              t: "sigpq_tratamento_mobilidades",
            })
              .select("t.*")
              .where("t.numero_guia", item.numero_guia)
              .where("t.activo", true)
              .first();

            const agentes: any = await this.agentePorGuia({
              numero_guia: item?.numero_guia,
            });

            delete item.user_id;
            delete item.pessoajuridica_id;

            return {
              ...item,
              agentes,
              pessoajuridica_actual: colocacao,
              pessoajuridica_passado: colocacao_passado,
              user: user,
              tratamento,
              status: estado(tratamento?.estado),
              agente_responsavel: responsavel,
            };
          })
        );
        return all;
      }

      return despachos;

      let query: DatabaseQueryBuilderContract = Database.from({
        fo: "sigpq_funcionario_orgaos",
      })
        .select(
          "fo.*"
          // "fo.id",
          // "fo.pessoajuridica_id",
          // "fo.pessoafisica_id",
          // "fo.user_id",
          // "fo.despacho"
        )
        // .innerJoin('sigpq_tipo_funcaos as tf', 'tf.id', 'f.sigpq_tipo_funcao_id')
        // .sigpq_tipo_funcaos
        .where("fo.activo", true)
        .where("fo.eliminado", false)
        // .whereIn('fo.despacho', despachos)
        // .groupBy(['fo.user_id'])
        .limit(100);

      // console.log(await query);

      // if (options.pessoajuridica_id) {
      //   query.where('fo.pessoajuridica_id', options.pessoajuridica_id)
      // }

      // if (options.search) {
      //   query.where('fo.nome', 'like', `%${options.search}%`)
      // }

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }

  public async listar(options: any): Promise<any> {
    try {
      let despachos = Database.from({ f: "sigpq_funcionarios" })
        .select(
          Database.raw("upper(p.nome_completo) as nome_completo"),
          "p.activo",
          "pj.sigla",
          "pf.apelido",
          "pf.genero",
          "pf.estado",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.id",
          "patentes.nome as patente_nome",
          "fo.pessoajuridica_id",
          "fo.pessoajuridica_passado_id",
          "fo.numero_guia",
          "fo.despacho",
          "fo.data_ingresso",
          "fo.pessoafisica_id",
          "fo.user_id",
          "fo.id as sigpq_funcionario_orgao_id",
          "regimes.quadro",
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw(
            "DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas as p", "p.id", "f.id")
        .innerJoin("pessoafisicas as pf", "pf.id", "f.id")
        .innerJoin("sigpq_provimentos", "sigpq_provimentos.pessoa_id", "p.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin(
          "sigpq_funcionario_orgaos as fo",
          "fo.pessoafisica_id",
          "pf.id"
        )
        .innerJoin("regimes", "regimes.id", "pf.regime_id")
        .innerJoin("pessoajuridicas as pj", "pj.id", "fo.pessoajuridica_id")
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
        .where("sigpq_provimentos.activo", true)
        .where("fo.nivel_colocacao", "muito-alto")
        .where("sigpq_provimentos.eliminado", false)
        .where("fo.activo", true)
        .where("fo.eliminado", false)
        .where((query) => {
          if (options.search) {
            query.where("fo.despacho", "like", `%${options.search}%`);
            query.orWhere("fo.numero_guia", "like", `%${options.search}%`);
            query.orWhere(
              "pessoajuridicas.sigla",
              "like",
              `%${options.search}%`
            );
            query.orWhere("passado.sigla", "like", `%${options.search}%`);
            query.orWhere(
              "pessoas.nome_completo",
              "like",
              `%${options.search}%`
            );
            query.orWhere("p.nome_completo", "like", `%${options.search}%`);
            // query.orWhere('fo.ordem_descricao', options.search)
            query.orWhere(
              "fo.despacho_descricao",
              "like",
              `%${options.search}%`
            );
            // query.orWhere('fo.numero_ordem', options.search)
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
          if (options.numero_guia) {
            query.where("fo.numero_guia", options.numero_guia);
          }
        })
        .where((query) => {
          if (options.regimeId) {
            query.where("pf.regime_id", Number(options.regimeId));
          }
        })
        .where((query) => {
          if (options.patenteId) {
            query.where("patentes.id", Number(options.patenteId));
          }
        })
        .where((query) => {
          if (options.tipoVinculoId) {
            query.where(
              "f.sigpq_tipo_vinculo_id",
              Number(options.tipoVinculoId)
            );
          }
        })
        .where((query) => {
          if (options.patenteClasse) {
            query.where(
              "patentes.sigpq_tipo_carreira_id",
              Number(options.patenteClasse)
            );
          }
        })
        .where((query) => {
          if (options.user?.aceder_todos_agentes) {
            if (options.orgaoId) {
              query.where("fo.pessoajuridica_id", options.orgaoId);
              query.orWhere("fo.pessoajuridica_passado_id", options.orgaoId);
            }
          } else {
            query.where("fo.pessoajuridica_id", options.orgao?.id);
            query.orWhere("fo.pessoajuridica_passado_id", options.orgao?.id);
          }
        })

        .where((query) => {
          if (options.genero) {
            query.where("pf.genero", options.genero);
          }
        })
        .clone();

      if (options.page) {
        const pagination = await despachos.paginate(
          options.page,
          options.perPage || 10
        );
        pagination["rows"] = await Promise.all(
          pagination["rows"].map(async (item: any) => {
            const colocacao = await this.buscarColocacao(
              item?.pessoajuridica_id
            );
            const colocacao_passado = await this.buscarColocacao(
              item?.pessoajuridica_passado_id
            );
            const user = await this.buscarUtilizador(item.user_id);
            const responsavel = await this.mobilidadeResponsavel(
              item?.sigpq_funcionario_orgao_id
            );

            delete item.user_id;
            delete item.pessoajuridica_id;

            return {
              ...item,
              pessoajuridica_actual: colocacao,
              pessoajuridica_passado: colocacao_passado,
              user: user,
              responsavel,
            };
          })
        );

        return pagination;
      } else {
        const items = await despachos;
        const all = await Promise.all(
          items.map(async (item: any) => {
            const colocacao = await this.buscarColocacao(
              item?.pessoajuridica_id
            );
            const colocacao_passado = await this.buscarColocacao(
              item?.pessoajuridica_passado_id
            );
            const user = await this.buscarUtilizador(item?.user_id);
            const responsavel = await this.mobilidadeResponsavel(
              item?.sigpq_funcionario_orgao_id
            );

            delete item.user_id;
            delete item.pessoajuridica_id;

            return {
              ...item,
              pessoajuridica_actual: colocacao,
              pessoajuridica_passado: colocacao_passado,
              user: user,
              responsavel: responsavel,
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
  public async mobilidadeResponsavel(user_id: any): Promise<any> {
    try {
      let query = Database.from({ f: "sigpq_funcionarios" })
        .select(
          "pessoas.nome_completo",
          "patentes.nome as patente_nome",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.descricao",
          "f.id",
          "m.id as sigpq_mais_mobilidade_id",
          "m.ordenante as comandante",
          "m.sigpq_fun_id as sigpq_funcionario_orgao_id"
        )
        .innerJoin("pessoas", "pessoas.id", "f.id")
        .innerJoin("users as u", "u.pessoa_id", "pessoas.id")
        .innerJoin("pessoafisicas", "pessoafisicas.id", "f.id")
        .innerJoin("pais", "pais.id", "pessoafisicas.nacionalidade_id")
        .innerJoin(
          "sigpq_provimentos",
          "sigpq_provimentos.pessoa_id",
          "pessoas.id"
        )
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin(
          "estado_civils",
          "estado_civils.id",
          "pessoafisicas.estado_civil_id"
        )
        .innerJoin("sigpq_mais_mobilidades as m", "m.pessoafisica_id", "f.id")
        .where("sigpq_provimentos.activo", true)
        .where("u.id", user_id)
        .first();

      return await query;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }

  public async agentePorGuia(options: any): Promise<any> {
    try {
      let query = Database.from({ f: "sigpq_funcionarios" })
        .select(
          "f.*",
          "m.id as mais_mobilidade_id",
          "m.*",
          "pj.id as pessoajuridica_id",
          "pj.*",
          "fo.*"
        )
        .innerJoin(
          "sigpq_funcionario_orgaos as fo",
          "fo.pessoafisica_id",
          "f.id"
        )
        .innerJoin("sigpq_mais_mobilidades as m", "m.sigpq_fun_id", "fo.id")
        .innerJoin("pessoajuridicas as pj", "pj.id", "fo.pessoajuridica_id")
        .where("fo.activo", true)
        .where("fo.eliminado", false)
        .where((query: any) => {
          if (options.numero_guia) {
            query.where("fo.numero_guia", options.numero_guia);
          }
        });

      return await query;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }

  public async eliminar(id: any, trxParam = null): Promise<any> {}

  public async listarTodosPorPessoa(options: any): Promise<any> {
    try {
      let despachos: DatabaseQueryBuilderContract = Database.from({
        fo: "sigpq_funcionario_orgaos",
      })
        .select(
          "fo.id",
          "fo.pessoajuridica_id",
          "fo.user_id",
          "fo.despacho",
          "fo.despacho_descricao",
          "fo.numero_guia",
          "fo.sigpq_documento_anexo_id",
          "sigpq_documentos.anexo",
          //"sigpq_documentos_2.anexo as anexo_2",
          // 'fo.numero_ordem',
          // 'fo.ordem_descricao',
          // 'fo.anexo_guia',
          // 'fo.anexo_ordem',
          "pj.sigla as pessoajuridica_actual_sigla",
          "pjd.sigla as pessoajuridica_passado_sigla",
          "p.nome_completo as pessoajuridica_actual",
          "pd.nome_completo as pessoajuridica_passado",
          "fo.activo",
          Database.raw(
            "DATE_FORMAT(fo.data_ingresso, '%d/%m/%Y') as data_ingresso"
          ),
          Database.raw(
            "DATE_FORMAT(fo.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(fo.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .leftJoin("pessoajuridicas as pj", "pj.id", "fo.pessoajuridica_id")
        .leftJoin("pessoas as p", "p.id", "pj.id")
        .leftJoin(
          "pessoajuridicas as pjd",
          "pjd.id",
          "fo.pessoajuridica_passado_id"
        )
        .leftJoin("pessoas as pd", "pd.id", "pjd.id")
        .leftJoin(
          "sigpq_documentos",
          "sigpq_documentos.id",
          "fo.sigpq_documento_anexo_id"
        )
        /* .leftJoin(
          "sigpq_documentos as sigpq_documentos_2",
          "sigpq_documentos_2.id",
          "fo.sigpq_documento_anexo_id"
        ) */
        .orderBy("fo.activo", "desc")
        // .where('fo.eliminado', false)
        .where("fo.nivel_colocacao", "muito-alto")
        // .where('fo.activo', 'false')
        .where((query: any) => {
          if (options.pessoafisica_id) {
            query.where("fo.pessoafisica_id", options.pessoafisica_id);
          }
        })
        .where((query): any => {
          if (options.search) {
            query.where("fo.despacho", "like", `%${options.search}%`);
            query.orWhere("fo.numero_guia", "like", `%${options.search}%`);
            query.orWhere("fo.numero_ordem", "like", `%${options.search}%`);
            query.orWhere("pj.sigla", "like", `%${options.search}%`);
            query.orWhere("pjd.sigla ", "like", `%${options.search}%`);
            query.orWhere("p.nome_completo", "like", `%${options.search}%`);
            query.orWhere("pd.nome_completo ", "like", `%${options.search}%`);
          }
        });

      return options.page
        ? await despachos.paginate(options.page, options.perPage || 10)
        : await despachos;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }

  public async editarEstado(pessoafisicaId, trxParam = null) {
    // const trx = trxParam ? trxParam : await Database.transaction()
    // await Database
    //   .from('sigpq_funcionario_orgaos')
    //   .useTransaction(trx)
    //   .where('pessoafisica_id', pessoafisicaId)
    //   .where('activo', true)
    //   .where('eliminado', false)
    //   .update({activo:false})
  }

  public async buscarColocacao(pessoajuridica_id: any) {
    if (!pessoajuridica_id) {
      return null;
    }

    return await Database.from({ p: "pessoas" })
      .select(
        "p.id",
        Database.raw("upper(p.nome_completo) as nome_completo"),
        "pf.sigla"
      )
      .innerJoin("pessoajuridicas as pf", "pf.id", "p.id")
      .where("p.id", pessoajuridica_id)
      .first();
  }

  public async buscarUtilizador(user_id: any) {
    if (!user_id) {
      return null;
    }

    return await Database.from({ u: "users" })
      .select("u.id", "u.username", "u.email")
      .where("u.id", user_id)
      .first();
  }

  public async buscarPessoaPorUserId(id: any): Promise<any> {
    return id
      ? await Database.from({ u: "users" })
          .select("u.pessoa_id ")
          .where("u.id", id)
          .where("u.eliminado", false)
          .where("u.activo", true)
          .first()
      : null;
  }

  public async buscarOrgaoAnterior(pessoafisica_id: any, nivel: string) {
    return pessoafisica_id
      ? await Database.from({ o: "sigpq_funcionario_orgaos" })
          .select("o.pessoajuridica_id as pessoajudidica_id_passado")
          .where("o.pessoafisica_id", pessoafisica_id)
          .where("o.eliminado", false)
          .where("nivel_colocacao", nivel)
          // .where('situacao', 'actual')
          .where("o.activo", true)
          .first()
      : null;
  }

  public async getNumeroGuia(
    pessoajuridicaId: any,
    pessoajuridica_passado_id: any = null
  ) {
    const anoGuia = this.dateTime.getFullYear();
    const orgao = await this.buscarColocacao(pessoajuridicaId);
    const orgaoPassado = pessoajuridica_passado_id
      ? await this.buscarColocacao(pessoajuridica_passado_id)
      : null;
    if (!orgao) return Error("Não foi possível gerar guia");

    const siglaOgao = orgaoPassado
      ? this.getSiglaSIC(orgaoPassado?.sigla) +
        "/" +
        this.getSiglaSIC(orgao?.sigla)
      : this.getSiglaSIC(orgao?.sigla);
    const guia = `${this.numeroAutomatico + 1}/${siglaOgao}/${anoGuia}`;

    if (await this.buscarNumeroGuia(guia, pessoajuridicaId)) {
      this.getNumeroGuia(pessoajuridicaId, pessoajuridica_passado_id);
      this.gerarNumeroOutro();
    }
    return guia;
  }

  public async buscarNumeroGuia(
    guia: any,
    pessoajuridicaId: any
  ): Promise<any> {
    return guia
      ? await Database.from({ f: "sigpq_funcionario_orgaos" })
          .select("*")
          .where("numero_guia", guia)
          .where("pessoajuridica_id", "<>", pessoajuridicaId)
          .first()
      : null;
  }

  public getSiglaSIC(sigla: any) {
    return `${sigla}-SIC`;
  }

  public async gerarNumeroOutro() {
    this.numeroAutomatico =
      await this.#numeroAutomaticoService.gerarNumeroAutomatico("Numero_guia");
  }

  
}
