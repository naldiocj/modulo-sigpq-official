import Database from '@ioc:Adonis/Lucid/Database'; 
import InternalServerException from 'App/Exceptions/InternalServerException';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';

export default class CreateUtilizadorRepository { 
  #baseRepo
  #tabela = 'roles'
  constructor() {
    this.#baseRepo = new BaseModuloRepository(this.#tabela)
  }

  // public async execute(input: any): Promise<any> {

  //   const trx = await Database.transaction()
  //   try {

  //     const utilizador: UtilizadorENTRADA = { ...input }

  //     await Database
  //       .insertQuery() // 👈 gives an instance of insert query builder
  //       .table('users')
  //       .useTransaction(trx)
  //       .insert(utilizador)

  //     return await trx.commit()

  //   } catch (e) {
  //     await trx.rollback()
  //     console.log(e);
  //     return Error('Não foi possível criar um novo registo.');
  //   }

  // }

  public async registar(input: any): Promise<any> {

    // const validar = new Validation(this.#baseRepo)
    // const respostaValidar = await validar.exetute(input)

    // if (respostaValidar.seTemErro) {
    //   return respostaValidar.Erro
    // }

    // if (!input?.tipo_veiculo_id) {
    //   return Error('O campo Tipo de veículo é obrigatório')
    // }
   
    const trx = await Database.transaction()
    try {
      await this.#baseRepo.registar(input, trx)
      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw new InternalServerException()
    }

  }
}
