import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Repository from '../../repositories/redefinir-senha-repositorio';

const { ok } = require('App/Helper/Http-helper');

export default class Controller {
  #repo
  constructor() {
    this.#repo = new Repository()
  }

  public async redefinirSenha({ auth, params, response }:HttpContextContract): Promise<any> {

    const user = auth.use('jwt').payload

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }

    const data = {
      user_id: 2,
      id: params.id
    }

    const result = await this.#repo.redefinirSenha(data)
    
    if (!result) {
      return response.badRequest({
        message: 'Utilizador não encontrado.',
        object: null,
      });
    }

    return ok(null, 'Senha redefinida com sucesso!');

  }

}
