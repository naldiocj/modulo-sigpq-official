import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Repository from '../../repositories/eliminar-repository'
import Logger from 'Config/winston'
import { getLogFormated } from 'Config/constants'

export default class Controller {
  #repo
  constructor() {
    this.#repo = new Repository()
  }

  public async execute({ auth, params, response, request }: HttpContextContract): Promise<any> {
    const { id } = params

    if (!auth.user) {
      return response.unauthorized({
        message: 'Usuário não autenticado.',
        object: null,
      })
    }

    const result = await this.#repo.execute(id, auth.user.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      })
    }

      const clientIp = request.ip();

    const { user } = auth;

    Logger.info(
      getLogFormated(user, "eliminar", "funcionários em cargos de chefia"),
      {
        user_id: user?.id,
        ip: clientIp,
      }
    );

    return response.ok({
      message: 'Sucesso ao eliminar Efectivo do seu cargo!',
      object: null,
    })
  }
}
