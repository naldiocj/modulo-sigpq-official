import Database from "@ioc:Adonis/Lucid/Database";
import CrudDocumentoBaseRepository from "../../documento/repositories/crud-base-repositorio";
import NumeroAutomaticoService from "App/@piips/shared/service/NumeroAutomaticoService";
const {
  uploadFile,
  deleteDirectory,
} = require("App/@piips/shared/metodo-generico/Upload-Or-Read-File");
const {
  extensao_ordem,
  extensao_despacho,
} = require("App/@piips/shared/metodo-generico/Buscar-Data-Extensao");
export default class RegistarRepository {
  #table = "sigpq_provimentos";
  #crudDocumentoBaseRepository;
  #numeroUnico: NumeroAutomaticoService;
  constructor() {
    this.#crudDocumentoBaseRepository = new CrudDocumentoBaseRepository();
    this.#numeroUnico = new NumeroAutomaticoService();
  }

  public get dateTime() {
    return new Date();
  }

  public async execute(input: any, file: any): Promise<any> {
    const trx = await Database.transaction();
    try {
      // if (await this.buscarNip(input.nip)) {
      //   return Error('Número do nip já existe')
      // }

      // const patente_antiga: any = await this.buscarPessoa(pessoa)

      // if (patente_antiga.id < input.patente_id) {
      //   input.activo = false;

      // } else {

      // }

      const pessoas = input.pessoas_id?.toString().split(",");
      const file_provimento = file.file("anexo");
      // const file_nomeacao = file.file("anexo_nomeacao");
      const anexo = file_provimento
        ? await uploadFile('cgpna_despacho_'+input?.user_id, file_provimento)
        : null;

      const generatorInstance = this.generator(input, trx, pessoas);
      await this.processGenerator(generatorInstance, anexo);

      return await trx.commit();
    } catch (e) {
      console.log(e);
      await trx.rollback();
      // await deleteDirectory(pessoa + '/anexo-guia')
      return Error("Não foi possível criar registo");
    }
  }

  private async *generator(input: any, trx: any, pessoas: any[]) {
    for (const pessoa of pessoas) {
      yield {
        pessoa,
        input,
        trx,
      };
    }
  }

  private async processGenerator(generator: any, anexo: any) {
    const numeroUnico = await this.#numeroUnico.gerarNumeroDataAutomatico();

    for await (const { pessoa, input, trx } of generator) {
      let ordem_data: string | null = null;
      let ordem_descricao: string | null = null;
      let numero_ordem: string | null = null;
      let data_provimento: string | null = null;

      if (input.situacao == "actual" || input.situacao != "anterior") {
        await Database.from("sigpq_provimentos")
          .useTransaction(trx)
          .where("pessoa_id", pessoa)
          .update({
            activo: false,
            situacao: this.isActual(input.situacao),
          });

        data_provimento = numeroUnico?.ordem_data ?? null;
        ordem_data = numeroUnico?.ordem_data ?? null;
        (ordem_descricao = numeroUnico.numero_ordem
          ? extensao_ordem(
              numeroUnico?.ordem_data,
              this.criarExtensao(numeroUnico.numero_ordem)
            )
          : null),
          (numero_ordem = numeroUnico.numero_ordem ?? null);
        if (
          !isNaN(input.sigpq_tipo_cargo_id) &&
          Number(input.sigpq_tipo_cargo_id)
        ) {
          await Database.from("sigpq_cargos")
            .useTransaction(trx)
            .where("pessoafisica_id", pessoa)
            .update({
              activo: false,
              situacao: this.isActual(input.situacao, false),
            });
        }
      } else {
        data_provimento = input.data_ordem ?? null;
        ordem_data = input.data_ordem ?? null;
        ordem_descricao = input.numero_ordem
          ? extensao_despacho(input?.data_ordem, input.numero_ordem)
          : null;
        numero_ordem = input.numero_ordem ?? null;
      }

      const passaporte = {
        anexo: anexo,
        nid: "Profissional",
        pessoafisica_id: pessoa,
        user_id: input.user_id,
        sigpq_tipo_documento_id: 21,
      };

      const resultadoPassaporte =
        await this.#crudDocumentoBaseRepository.registar(passaporte, trx);

      if (resultadoPassaporte instanceof Error) {
        return resultadoPassaporte;
      }

      const provimento = {
        pessoa_id: pessoa,
        patente_id: input.patente_id,
        data_provimento: data_provimento,
        ordem_data: ordem_data,
        ordem_descricao: ordem_descricao,
        despacho_descricao: input?.numero_despacho
          ? extensao_despacho(input?.data_despacho, input?.numero_despacho)
          : null,
        despacho_data: input?.data_despacho ?? null,
        numero_despacho: input?.numero_despacho ?? null,
        numero_ordem: numero_ordem,
        acto_progressao_id: input?.sigpq_acto_progressao_id ?? 3,
        user_id: input.user_id,
        // anexo: anexo,
        sigpq_documento_id: resultadoPassaporte[0],
        situacao: input?.situacao,
        activo: input.situacao == "anterior" ? 0 : 1,
        created_at: this.dateTime,
        updated_at: this.dateTime,
      };

      await Database.insertQuery()
        .table("sigpq_provimentos")
        .useTransaction(trx)
        .insert(provimento);

      await Database.from("sigpq_agente_em_excepcaos")
        .where("sigpq_funcionario_id", pessoa)
        .update({
          eliminado: true,
          user_id: input.user_id,
        })
        .useTransaction(trx);

      if (
        !isNaN(input.sigpq_tipo_cargo_id) &&
        Number(input.sigpq_tipo_cargo_id)
      ) {
        const passaporte_ = {
          anexo: anexo,
          nid: "Profissional",
          pessoafisica_id: pessoa,
          user_id: input.user_id,
          sigpq_tipo_documento_id: 21,
        };

        const resultadoPassaporte_ =
          await this.#crudDocumentoBaseRepository.registar(passaporte_, trx);

        if (resultadoPassaporte_ instanceof Error) {
          return resultadoPassaporte_;
        }

        const sigpq_cargo = {
          sigpq_tipo_cargo_id: input.sigpq_tipo_cargo_id,
          pessoafisica_id: pessoa,
          pessoajuridica_id: input.orgao_id,
          patente_id: input.patente_id,
          numero_despacho: input?.numero_despacho_nomeacao
            ? extensao_despacho(
                input?.data_despacho_nomeacao,
                input?.numero_despacho_nomeacao
              )
            : null,
          numero_ordem: input?.numero_despacho_nomeacao ?? null,
          sigpq_acto_nomeacao_id: input?.sigpq_acto_nomeacao_id,
          sigpq_documento_id: resultadoPassaporte_[0],
          situacao: this.getSituacao(input.situacao),
          activo: input.situacao == "anterior" ? 0 : 1,
          data: input?.data_despacho_nomeacao ?? null,
          user_id: input.user_id,
          created_at: this.dateTime,
          updated_at: this.dateTime,
        };

        await Database.insertQuery()
          .table("sigpq_cargos")
          .useTransaction(trx)
          .insert(sigpq_cargo);
      }

      //   if (
      //     !isNaN(input.sigpq_tipo_funcao_id) &&
      //     Number(input.sigpq_tipo_funcao_id)
      //   ) {
      //     const sigpq_funcao = {
      //       sigpq_tipo_funcao_id: input.sigpq_tipo_funcao_id,
      //       pessoafisica_id: pessoa,
      //       pessoajuridica_id: input.orgao_id,
      //       patente_id: input.patente_id,
      //       // numero_despacho: extensao_despacho(input?.data_despacho_nomeacao, input?.numero_despacho_nomeacao),
      //       numero_ordem: extensao_ordem(
      //         input?.data_ordem_nomeacao,
      //         input?.numero_ordem_nomeacao
      //       ),
      //       sigpq_acto_nomeacao_id: input?.sigpq_acto_nomeacao_id,
      //       // anexo: anexo,
      //       situacao: this.getSituacao(input.situacao),
      //       activo: input.situacao == "anterior" ? 0 : 1,
      //       data: input?.data_ordem_nomeacao,
      //       user_id: input.user_id,
      //       created_at: this.dateTime,
      //       updated_at: this.dateTime,
      //     };

      //     await Database.insertQuery()
      //       .table("sigpq_funcaos")
      //       .useTransaction(trx)
      //       .insert(sigpq_funcao);
      //   }

      //   const promocao = {
      //     pessoa_id: pessoa,
      //     patente_id: input.patente_id,
      //     numero_despacho: input.numero_despacho,
      //     numero_ordem: input.numero_ordem,
      //     data_provimento: input.data_provimento,
      //     acto_progressao_id: input.sigpq_acto_progressao_id,
      //     // anexo,
      //     situacao: input?.situacao,
      //     activo: input.situacao == "anterior" ? 0 : 1,
      //     user_id: input.user_id,
      //     created_at: this.dateTime,
      //     updated_at: this.dateTime,
      //   };

      //   await Database.insertQuery()
      //     .table("sigpq_provimentos")
      //     .useTransaction(trx)
      //     .insert(promocao);
    }
  }

  public async buscarNip(n: any) {
    return await Database.from(this.#table).where("nip", n).first();
  }

  public async buscarProcesso(n: any) {
    return await Database.from(this.#table).where("numero_processo", n).first();
  }

  public async buscarAgente(n: any) {
    return await Database.from(this.#table).where("numero_agente", n).first();
  }
  public async buscarPessoa(n: any) {
    return await Database.from(this.#table)
      .where("pessoa_id", n)
      .where("activo", true)
      .first();
  }

  private getSituacao(situacao: string, provimento: boolean = false) {
    if (!provimento) {
      const situacaos = {
        actual: "actual",
        anterior: "exercída",
      };
      return situacaos.hasOwnProperty(situacao) ? situacaos[situacao] : "";
    } else {
      const situacaos = {
        actual: "actual",
        anterior: "anterior",
      };
      return situacaos.hasOwnProperty(situacao) ? situacaos[situacao] : "";
    }
  }

  private isActual(situacao: string, provimento: boolean = true) {
    if (provimento) {
      return ["actual"].includes(situacao.toLowerCase())
        ? "anterior"
        : situacao;
    } else {
      return ["actual"].includes(situacao.toLowerCase())
        ? "exercída"
        : situacao;
    }
  }

  public criarExtensao(numero: number): string {
    return `N.º ${numero}/CGPNA`;
  }
}
