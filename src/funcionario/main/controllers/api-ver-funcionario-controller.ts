import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import verRepositorio from '../../repositories/api-ver-funcionario-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class Controller {
  #repo
  constructor() {
    this.#repo = new verRepositorio()
  }

  public async execute({ params, response }: HttpContextContract): Promise<any> {
    
    const result = await this.#repo.ver(params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(result, null);

  }

  async validarNullOuUndefined(request:any, field:any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
