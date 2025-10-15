import Database from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";
import CrudDocumentoBaseRepository from "../../documento/repositories/crud-base-repositorio";
import CrudBaseRepository from "../../config/direcao-ou-orgao/repositories/crud-base-repositorio";
import VerRepository from "../../funcionario/repositories/ver-repositorio";
import { estado } from "../../correspondencia/utils/cor-estado-utils";
const {
  uploadFile,
  deleteDirectory,
} = require("App/@piips/shared/metodo-generico/Upload-Or-Read-File");
const {
  extensao_ordem,
  extensao_despacho,
} = require("App/@piips/shared/metodo-generico/Buscar-Data-Extensao");
import NumeroAutomaticoService from "App/@piips/shared/service/NumeroAutomaticoService";

const mapearCampos = require("App/@piips/shared/metodo-generico/MapearCampos");

interface ITratamento {
  user_id: number;
  nota: string;
  numero: string;
  estado: string;
  numero_despacho: string;
  data_despacho: string;
}

const cores = {
  P: {
    nome: "rgb(254, 176, 25)",
  },
  EX: {
    nome: "red",
  },
  A: {
    nome: "rgb(0, 143, 251)",
  },
};

export default class CrudBaseRepositorio extends BaseModuloRepository {
  // #agente: VerRepository;
  // #orgao: CrudBaseRepository;
  #numeroUnico: NumeroAutomaticoService;
  #crudDocumentoBaseRepository;
  constructor() {
    super("sigpq_proposta_provimentos");
    // this.#agente = new VerRepository();
    // this.#orgao = new CrudBaseRepository();
    this.#numeroUnico = new NumeroAutomaticoService();
    this.#crudDocumentoBaseRepository = new CrudDocumentoBaseRepository();
  }

  public async registar(
    input: ITratamento,
    file: any,
    trxParam: any = null
  ): Promise<any> {
    try {
      const camposDesejados: (keyof any)[] = [
        "numero",
        "nota",
        "estado",
        "user_id",
      ];

      mapearCampos(input, camposDesejados);
    } catch (error) {
      return Error(error.message);
    }

    const trx = trxParam || (await Database.transaction());
    try {
      const cor = cores[input.estado.toString().toUpperCase()].nome;
      const file_provimento = file.file("anexo");
      // const file_nomeacao = file.file("anexo_nomeacao");
      const anexo = file_provimento
        ? await uploadFile("cgpna_despacho_" + input?.user_id, file_provimento)
        : null;
      const propostas = await Database.from("sigpq_proposta_provimentos")
        .select("*")
        .where("numero", input.numero)
        .where("eliminado", false)
        .where("estado", "P");

      if (propostas) {
        await Database.from("sigpq_proposta_provimentos")
          .where("numero", input.numero)
          .update({
            updated_at: new Date(),
            user_id: input.user_id,
            estado: input.estado,
            cor: cor,
            descricao: input.nota,
          })
          .useTransaction(trx);

        const numeroUnico = await this.#numeroUnico.gerarNumeroDataAutomatico();

        for (let item of propostas) {
          if (!["A", "a"].includes(input.estado.toString())) return;
          const passaporte = {
            anexo: anexo,
            nid: "Profissional",
            pessoafisica_id: item?.sigpq_funcionario_id,
            user_id: input.user_id,
            sigpq_tipo_documento_id: 21,
          };

          const resultadoPassaporte =
            await this.#crudDocumentoBaseRepository.registar(passaporte, trx);

          if (resultadoPassaporte instanceof Error) {
            return resultadoPassaporte;
          }

          let despacho = {
            despacho_descricao: input?.numero_despacho
              ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
              : null,
            despacho_data: input?.data_despacho ?? null,
            numero_despacho: input?.numero_despacho ?? null,
          };

          await Database.from("sigpq_provimentos")
            .useTransaction(trx)
            .where("pessoa_id", item.sigpq_funcionario_id)
            .update({
              activo: false,
              situacao: "anterior",
            });

          const provimento = {
            pessoa_id: item?.sigpq_funcionario_id,
            patente_id: item?.patente_id,
            data_provimento: numeroUnico?.ordem_data ?? null,
            ordem_data: numeroUnico?.ordem_data ?? null,
            ordem_descricao: numeroUnico.numero_ordem
              ? extensao_ordem(
                  numeroUnico?.ordem_data,
                  this.criarExtensao(numeroUnico.numero_ordem)
                )
              : null,
            ...despacho,
            numero_ordem: numeroUnico.numero_ordem ?? null,
            acto_progressao_id: item?.sigpq_acto_progressao_id ?? 3,
            user_id: input.user_id,

            sigpq_documento_id: resultadoPassaporte[0],
            situacao: "actual",
            activo: 1,
            ...this.getData,
          };

          await Database.insertQuery()
            .table("sigpq_provimentos")
            .useTransaction(trx)
            .insert(provimento);

          await Database.from("sigpq_agente_em_excepcaos")
            .where("sigpq_funcionario_id", item?.sigpq_funcionario_id)
            .update({
              eliminado: true,
              user_id: input.user_id,
            })
            .useTransaction(trx);

          if (
            item.sigpq_tipo_cargo_id &&
            Number(item.sigpq_tipo_cargo_id) > 0
          ) {
            await Database.from("sigpq_cargos")
              .useTransaction(trx)
              .where("pessoafisica_id", item?.sigpq_funcionario_id)
              .update({
                activo: false,
                situacao: "exercída",
              });

            const passaporte_ = {
              anexo: anexo,
              nid: "Profissional",
              pessoafisica_id: item.sigpq_funcionario_id,
              user_id: input.user_id,
              sigpq_tipo_documento_id: 21,
            };

            const resultadoPassaporte_ =
              await this.#crudDocumentoBaseRepository.registar(
                passaporte_,
                trx
              );

            if (resultadoPassaporte_ instanceof Error) {
              return resultadoPassaporte_;
            }

            const sigpq_cargo = {
              sigpq_tipo_cargo_id: item.sigpq_tipo_cargo_id,
              pessoafisica_id: item.sigpq_funcionario_id,
              pessoajuridica_id: item.pessoajuridica_id,
              patente_id: item.patente_id,

              numero_despacho: despacho.despacho_descricao,
              numero_ordem: despacho.numero_despacho,
              sigpq_acto_nomeacao_id: item?.sigpq_acto_nomeacao_id,
              sigpq_documento_id: resultadoPassaporte_[0],
              situacao: "actual",
              activo: 1,
              data: despacho.despacho_data,
              user_id: input.user_id,
              ...this.getData,
            };

            await Database.insertQuery()
              .table("sigpq_cargos")
              .useTransaction(trx)
              .insert(sigpq_cargo);
          }
        }
      }

      if (!trxParam) {
        await trx.commit();
      }

      return trx;
    } catch (e) {
      trxParam ?? (await trx.rollback());
      console.log(e);
      return Error("Não foi possível registar");
    }
  }

  private get getData() {
    return {
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  public criarExtensao(numero: number): string {
    return `N.º ${numero}/CGPNA`;
  }
}
