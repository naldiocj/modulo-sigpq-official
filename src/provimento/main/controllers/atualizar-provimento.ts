import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import EditarProvimentoRepository from '../../repositories/editar-provimento'
const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')
export default class AtualizarController {
  #repo
  constructor() {
    this.#repo = new EditarProvimentoRepository()
  }

  public async execute({ params,auth, request, response }: HttpContextContract): Promise<any> {



    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })


    const result = await this.#repo.editar(input,params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return response.ok({
      message: 'Sucesso ao atualizar provimento!',
      object: null,
    });

  }


}
