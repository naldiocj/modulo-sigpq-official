import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegistarPerfilRepositorio from '../../repositories/registar-perfil-repositorio'

const { ok } = require('App/Helper/Http-helper');

export default class RegistarUtilizadorController {
  #repo
  constructor() {
    this.#repo = new RegistarPerfilRepositorio()
  }

  public async execute({ auth, request, response }: HttpContextContract): Promise<any> {


    const input = {
      ...request.all(),
      name: request.input('nome'),
      user_id: auth.user?.id
    }
 
    const result = await this.#repo.registar(input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      })
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Utilizador",
      //   event: "Utilizador registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Utilizador registado com sucesso!",
      // });
    }

    return ok(null, 'Sucesso ao registar Utilizador!');

  }
}
