import Database from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";
import CrudRepository from "../../config/vaga-promocao-proposta/repositories/crud-repositorio";

export default class EliminarRepository extends BaseModuloRepository {
  #vagas: CrudRepository;
  constructor() {
    super("sigpq_proposta_provimentos");
    this.#vagas = new CrudRepository();
  }

  public async execute(
    id: any,
    trx: any = null,
    user_id: any = null
  ): Promise<any> {
    trx = trx ?? (await Database.transaction());
    try {
      const agenteEmProposta = await this.findById(id);

      if (agenteEmProposta instanceof Error) {
        return Error(agenteEmProposta.message);
      }

      if (!agenteEmProposta) {
        return Error("Agente não encontrado na proposta");
      }

      const {
        patente_id,
        pessoajuridica_id,
      }: { patente_id: number; pessoajuridica_id: number } = agenteEmProposta;

      const patenteSelecionado = await this.buscarPatente(patente_id);

      if (!patenteSelecionado || patenteSelecionado instanceof Error) {
        return Error("Sem patente encontrado");
      }
      const options = {
        situacao: "aberto",
        pessoajuridica_id: pessoajuridica_id,
        patente_id: patente_id,
      };
      const vaga = await this.#vagas.listarTodos(options);

      if (vaga instanceof Error) {
        return Error(vaga.message);
      }

      if (vaga.length == 0) {
        return Error("Falha na remoção do agente na posta");
      }
      const vagaEncontrada = vaga[0];

      if (!vagaEncontrada.quantidade) {
        return Error("Falha na remoção do agente na posta");
      }
      let vagaQtd = vagaEncontrada.quantidade + 1;

      if (vagaEncontrada.quantidade >= vagaEncontrada.quantidade_inicial) {
        vagaQtd = vagaEncontrada.quantidade;
      }

      await Database.from("sigpq_vaga_em_promocao_por_orgaos")
        .where("pessoajuridica_id", pessoajuridica_id)
        .where("patentes_id", patente_id)
        .where("eliminado", false)
        .where("situacao", "aberto")
        .where("activo", true)
        .update({
          quantidade: vagaQtd,
          user_id: user_id,
          updated_at: new Date(),
        })
        .useTransaction(trx);

      await Database.from(this.tabela)
        .where("id", id)
        .useTransaction(trx)
        .update({
          eliminado: true || 1,
          user_id: user_id ?? null,
        });
      return await trx.commit();
    } catch (e) {
      console.log(e);
      await trx.rollback();
      throw Error("Não foi foi possivel eliminar");
    }
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
}
