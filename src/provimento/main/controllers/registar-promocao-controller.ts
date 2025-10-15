import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegistarRepositorio from '../../repositories/registar-promocao-repositorio'
const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')
export default class RegistarController {
  #repo
  constructor() {
    this.#repo = new RegistarRepositorio()
  }

  public async execute({ auth, request, response }: HttpContextContract): Promise<any> {


    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })


   
    const result = await this.#repo.execute(input, request)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return response.ok({
      message: 'Sucesso ao registar provimento!',
      object: null,
    });

  }


}
