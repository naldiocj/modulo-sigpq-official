import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ListarEmTempoRepositorio from '../../repositories/listar-em-tempo-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class ListarEmTempoController {
  #repo: ListarEmTempoRepositorio
  constructor() {
    this.#repo = new ListarEmTempoRepositorio()
  }

  public async execute({ params, response }: HttpContextContract): Promise<any> {



    const result = await this.#repo.listarPorPessoa(params.pessoaId)

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
