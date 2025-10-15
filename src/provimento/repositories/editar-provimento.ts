import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";
import NumeroAutomaticoService from "../../../../../app/@piips/shared/service/NumeroAutomaticoService";

const {
  extensao_ordem,
  extensao_despacho,
} = require("App/@piips/shared/metodo-generico/Buscar-Data-Extensao");
// import { QueryableBase } from 'mysql2/typings/mysql/lib/protocol/sequences/QueryableBase';

export default class EditarProvimentoRepository {

  #numeroUnico: NumeroAutomaticoService;
  constructor() {
    this.#numeroUnico = new NumeroAutomaticoService();
  }

  public async editar(input: any, id: number, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()
    let _ordem_descricao;
    try {
      //const numeroUnico = await this.#numeroUnico.gerarNumeroDataAutomatico();

      _ordem_descricao = input.numero_ordem
          ? extensao_despacho(input?.ordem_data, input.numero_ordem)
          : null;

      const sigpq_cargo = {
        despacho_descricao:extensao_despacho(
              input.despacho_data,
              input.numero_despacho
            ),
        ordem_descricao:_ordem_descricao,
        numero_ordem: input.numero_ordem,
        numero_despacho: input.numero_despacho,
        ordem_data:input.ordem_data,
        despacho_data:input.despacho_data
      };
      await Database.from('sigpq_provimentos')
        .where("id", id)
        .update(sigpq_cargo)
        .useTransaction(trx);

      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      return Error('Não foi possível atualizar Provimento.');
    }

  }


}
