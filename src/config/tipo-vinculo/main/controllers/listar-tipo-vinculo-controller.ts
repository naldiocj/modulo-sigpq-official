import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ListarTipoVinculoRepositorio from '../../repositories/listar-tipo-vinculo-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class RegistarTipoHabilitacaoLiterariaController {
  #repo
  constructor() {
    this.#repo = new ListarTipoVinculoRepositorio()
  }

  public async execute({ request }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      regime: await this.validarNullOuUndefined(request, "regime"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      sigpq_vinculo_id: await this.validarNullOuUndefined(request, 'sigpq_vinculo_id')
    }

    const result = await this.#repo.listarTodos(options)

    return ok(result, null);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
