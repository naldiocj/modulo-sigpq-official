import Repository from '../../repositories/listar-utilizador-sem-contas-repositorio';

const { ok } = require('App/Helper/Http-helper');

export default class Controller {
  #repo
  constructor() {
    this.#repo = new Repository()
  }

  public async listarTodos(): Promise<any> {

    const result = await this.#repo.listarTodos()

    return ok(result, null);

  }

}
