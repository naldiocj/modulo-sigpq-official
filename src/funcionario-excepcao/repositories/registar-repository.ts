import Database from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";
import ListarPorPessoaRepository from "./listar-por-pessoa-repository";
const mapearCampos = require("App/@piips/shared/metodo-generico/MapearCampos");

type IInput = {
  sigpq_funcionario_id: number;
  user_id: number;
  eliminado?: boolean;
  observacao?: string;
};

export default class RegistarRepository extends BaseModuloRepository {
  #listarEmTempo: ListarPorPessoaRepository;
  constructor() {
    super("sigpq_agente_em_excepcaos");
    this.#listarEmTempo = new ListarPorPessoaRepository();
  }

  async execute(input: IInput, trx: any = null): Promise<any> {
    trx = trx ?? (await Database.transaction());
    let validate = [];
    try {
      const camposDesejados: (keyof any)[] = [
        "sigpq_funcionario_id",
        "user_id",
      ];

      const camposOpcionais: (keyof any)[] = ["eliminado", "observacao"];

      validate = mapearCampos(input, camposDesejados, camposOpcionais);
    } catch (error) {
      return Error(error.message);
    }
    try {
      const funcionarioEmTempo = await this.#listarEmTempo.execute(
        input.sigpq_funcionario_id
      );


      console.log(funcionarioEmTempo)
      if (funcionarioEmTempo instanceof Error) {
        return Error(funcionarioEmTempo.message);
      }

      if (funcionarioEmTempo) {
        return Error("O agente já está dentro de diuturnidade");
      }

      const funcionario_em_excepto = await this.findBy(
        "sigpq_funcionario_id",
        input.sigpq_funcionario_id
      );

      if (funcionario_em_excepto instanceof Error) {
        return Error(funcionario_em_excepto.message);
      }

      if (funcionario_em_excepto) {
        return Error("O agente já está dentro de diuturnidade");
      }

      const inputChefia = {
        ...validate,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await Database.insertQuery()
        .insert(inputChefia)
        .table("sigpq_agente_em_excepcaos")
        .useTransaction(trx);

      return await trx.commit();
    } catch (error) {
      console.log(error);
      await trx.rollback();
      return Error("Não foi possível registar item");
    }
  }
}
