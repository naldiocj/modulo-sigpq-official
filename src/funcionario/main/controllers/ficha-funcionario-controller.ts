import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import verFichaRepositorio from '../../repositories/ficha-funcionario-respositorio'

const { ok } = require('App/Helper/Http-helper');


export default class Controller {
  #repo
  constructor() {
    this.#repo = new verFichaRepositorio()
  }

  public async execute({ params, response }: HttpContextContract): Promise<any> {

    const result = await this.#repo.execute(params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(result, null);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
