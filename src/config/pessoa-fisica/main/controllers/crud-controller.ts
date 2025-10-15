import CrudBaseRepository from '../../repositories/crud-base-repositorio';

const { ok } = require('App/Helper/Http-helper');

export default class Controller {
  #crud: CrudBaseRepository
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarEstados(): Promise<any> {

    const result = await this.#crud.listarEstados()

    return ok(result, null);

  }
 
}
