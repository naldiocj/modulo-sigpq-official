import Repository from '../../repositories/crud-repositorio';

const { ok } = require('App/Helper/Http-helper');

export default class Controller {
  #repo
  constructor() {
    this.#repo = new Repository()
  }

  public async forcarAlterarSenha({ params, response }): Promise<any> {

    const { email } = params

    const user = await this.#repo.buscarEmail(email)

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não encontrado.',
        object: null,
      });
    }

    return ok(user, null);

  }

  public async forcarAlterarSenhaStore({ request, response }): Promise<any> {

    const {
      email,
      password,
      novaPassword,
      confirmarPassword
    } = request.all()

    const user = await this.#repo.buscarEmail(email)

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não encontrado.',
        object: null,
      });
    }

    if (!email || !password || !novaPassword || !confirmarPassword) {
      return response.badRequest({
        message: 'Todos os campos são obrigatórios.',
        object: null,
      });
    }

    if (novaPassword != confirmarPassword) {
      return response.badRequest({
        message: 'As senhas não coincidem.',
        object: null,
      });
    }

    const alterar = await this.#repo.alterarSenha(user, password, novaPassword)
    
    if (alterar instanceof Error) {
      return response.badRequest({
        message: alterar.message,
        object: null,
      });
    }

    return ok(null, 'Senha alterada com sucesso!');

  }

}
