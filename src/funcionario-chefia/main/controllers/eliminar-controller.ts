import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Repository from '../../repositories/eliminar-repository'

export default class Controller {
  #repo
  constructor() {
    this.#repo = new Repository()
  }

  public async execute({ auth, params, response }: HttpContextContract): Promise<any> {
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

    return response.ok({
      message: 'Sucesso ao eliminar Efectivo do seu cargo!',
      object: null,
    })
  }
}
