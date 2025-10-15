import Database from "@ioc:Adonis/Lucid/Database";
import NumeroAutomaticoService from "App/@piips/shared/service/NumeroAutomaticoService";
import CrudBaseRepository from "../../funcionario/repositories/crud-base-repositorio";
import CrudRepository from "../../config/vaga-promocao-proposta/repositories/crud-repositorio";

export default class RegistarRepository {
  #numeroAutomaticoService: NumeroAutomaticoService;
  private agente: CrudBaseRepository;
  public numeroAutomatico: any;
  #vagas: CrudRepository;
  public pessoasQtd: number = 0;
  constructor() {
    this.#numeroAutomaticoService = new NumeroAutomaticoService();
    this.agente = new CrudBaseRepository();
    this.#vagas = new CrudRepository();
  }

  public dateTime() {
    return new Date();
  }
  public async execute(input: any): Promise<any> {
    this.numeroAutomatico =
      await this.#numeroAutomaticoService.gerarNumeroAutomatico(
        "Numero_Proposta"
      );
    const trx = await Database.transaction();
    try {
      const pessoas = input.pessoas_id?.toString().split(",");
      this.pessoasQtd = pessoas.length;

      if (!input.user?.aceder_todos_agentes) {
        const patenteSelecionado = await this.buscarPatente(input.patente_id);

        if (!patenteSelecionado || patenteSelecionado instanceof Error) {
          return Error("Sem patente encontrado");
        }
        const options = {
          situacao: "aberto",
          pessoajuridica_id: input.pessoajuridica_id,
          patente_id: input.patente_id,
        };
        const vaga = await this.#vagas.listarTodos(options);

        if (vaga instanceof Error) {
          return Error(vaga.message);
        }

        if (vaga.length > 0) {
          const vagaEncontrada = vaga[0];

          if (
            vagaEncontrada.quantidade &&
            vagaEncontrada.quantidade < this.pessoasQtd
          ) {
            return Error(
              "Sem vagas suficiente de progressão de carreira de " +
                patenteSelecionado.nome +
                " para " +
                input.orgao?.sigla +
                ", disponível " +
                vagaEncontrada.quantidade +
                " " +
                this.getVagas(vagaEncontrada.quantidade)
            );
          } else {
            console.log("Tem vaga");
          }
        } else {
          return Error(
            "Sem vagas de progressão de carreira de " +
              patenteSelecionado.nome +
              " para " +
              input.orgao?.sigla
          );
        }
      }

      if (!input.patente_id) {
        throw new Error("Sem posto selecionado");
      }

      const result = await this.processoGenerador(input, trx, pessoas);
      if (result instanceof Error) {
        return Error(result.message);
      }
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
        // numeroProposta,
        trx,
      };
    }
  }

  private async processoGenerador(input: any, trx: any, pessoas: any) {
    let vagaQtd: number = 0;
    for (const pessoa of pessoas) {
      const agente = await this.agente.listarUm(pessoa);
      let pessoajuridica_id: number = agente?.sigpq_tipo_orgao?.id;

      const numeroProposta = await this.getNumeroGuia(pessoajuridica_id);
      const proposta = {
        patente_id_actual: agente?.sigpq_provimento?.patente_id,
        sigpq_tipo_cargo_id_actual: agente?.sigpq_cargo?.sigpq_tipo_cargo_id,
        numero: numeroProposta,
        cor: "rgb(254, 176, 25)",
        sigpq_funcionario_id: pessoa,
        patente_id: input.patente_id,
        pessoajuridica_id: pessoajuridica_id,
        sigpq_acto_progressao_id: input?.sigpq_acto_progressao_id,
        sigpq_acto_nomeacao_id: Number(input?.sigpq_acto_nomeacao_id) || 0,
        sigpq_tipo_cargo_id: Number(input?.sigpq_tipo_cargo_id) || 0,
        descricao: input?.descricao,
        estado: input?.estado,
        activo: 1,
        user_id: input?.user_id,
        created_at: this.dateTime(),
        updated_at: this.dateTime(),
      };

      if (input.user?.aceder_todos_agentes) {
        const patenteSelecionado = await this.buscarPatente(input.patente_id);

        if (!patenteSelecionado || patenteSelecionado instanceof Error) {
          return Error("Sem patente encontrado");
        }
        const options = {
          situacao: "aberto",
          pessoajuridica_id: pessoajuridica_id,
          patente_id: input.patente_id,
        };
        const vaga = await this.#vagas.listarTodos(options);

        if (vaga instanceof Error) {
          return Error(vaga.message);
        }

        if (vaga.length > 0) {
          const vagaEncontrada = vaga[0];

          if (vagaEncontrada.quantidade == 0) {
            await Database.from("sigpq_vaga_em_promocao_por_orgaos")
              .where("pessoajuridica_id", pessoajuridica_id)
              .where("patentes_id", input.patente_id)
              .where("eliminado", false)
              .where("situacao", "aberto")
              .where("activo", true)
              .update({
                situacao: "fechado",
                activo: false,
                user_id: input.user_id,
                updated_at: new Date(),
              })
              .useTransaction(trx);
          } else if (vagaEncontrada.quantidade < this.pessoasQtd) {
            return Error(
              "Sem vagas suficiente de progressão de carreira de " +
                patenteSelecionado.nome +
                " para " +
                input.orgao?.sigla +
                ", disponível " +
                vagaEncontrada.quantidade +
                " " +
                this.getVagas(vagaEncontrada.quantidade)
            );
          } else {
            vagaQtd = vagaEncontrada.quantidade - this.pessoasQtd;

            await Database.insertQuery()
              .table("sigpq_proposta_provimentos")
              .useTransaction(trx)
              .insert(proposta);

            await Database.from("sigpq_vaga_em_promocao_por_orgaos")
              .where("pessoajuridica_id", pessoajuridica_id)
              .where("patentes_id", input.patente_id)
              .where("eliminado", false)
              .where("situacao", "aberto")
              .where("activo", true)
              .update({
                quantidade: vagaQtd,
                user_id: input.user_id,
                updated_at: new Date(),
              })
              .useTransaction(trx);
          }
        } else {
          return Error(
            "Sem vagas de progressão de carreira de " +
              patenteSelecionado.nome +
              " para " +
              agente?.sigpq_tipo_orgao?.sigla?.toString().toUpperCase()
          );
        }
      } else {
        await Database.insertQuery()
          .table("sigpq_proposta_provimentos")
          .useTransaction(trx)
          .insert(proposta);
      }
    }
  }

  public async getNumeroGuia(pessoajuridicaId: any) {
    const anoGuia = this.dateTime().getFullYear();
    const orgao = await this.buscarColocacao(pessoajuridicaId);
    if (!orgao) return Error("Não foi possível gerar identificação única");

    const siglaOgao = this.getSiglaPNA(orgao?.sigla);
    const guia = `PRO-${this.numeroAutomatico + 1}/${siglaOgao}/${anoGuia}`;

    if (await this.buscarNumeroGuia(guia, pessoajuridicaId)) {
      this.getNumeroGuia(pessoajuridicaId);
      this.gerarNumeroOutro();
    }
    return guia;
  }

  public async buscarNumeroGuia(
    guia: any,
    pessoajuridicaId: any
  ): Promise<any> {
    return guia
      ? await Database.from({ f: "sigpq_proposta_provimentos" })
          .select("*")
          .where("numero", guia)
          .where("pessoajuridica_id", "<>", pessoajuridicaId)
          .first()
      : null;
  }

  public async buscarColocacao(pessoajuridica_id: any) {
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

  public async gerarNumeroOutro() {
    this.numeroAutomatico =
      await this.#numeroAutomaticoService.gerarNumeroAutomatico(
        "Numero_Proposta"
      );
  }

  public getSiglaPNA(sigla: any) {
    return `${sigla}-PNA`;
  }

  public async buscarPatente(id: number): Promise<any> {
    try {
      return id
        ? await Database.from("patentes as p")
            .select("*")
            .where("p.id", id)
            .first()
        : null;
    } catch (error) {
      console.log(error);
      return Error("Não foi possível listar item");
    }
  }

  public getVagas(numero: number): string {
    return numero > 1 ? "vagas" : "vaga";
  }
}
