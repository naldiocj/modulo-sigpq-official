import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegistarRepositorio from '../../repositories/registar-propostas-repositorio'

export default class RegistarController {
  #repo:RegistarRepositorio
  constructor() {
    this.#repo = new RegistarRepositorio()
  }

  public async execute({ auth, request, response }: HttpContextContract): Promise<any> {

    const { user, orgao }: any = auth.use('jwt').payload
    const input = {
      ...request.all(),
      user,
      user_id: user?.id,
      pessoajuridica_id: orgao?.id,
      orgao

    }

    const result = await this.#repo.execute(input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return response.ok({
      message: 'Sucesso ao registar proposta!',
      object: null,
    });

  }
}
