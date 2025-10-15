import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ListarRepositorio from '../../repositories/listar-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class ListarController {
  #repo
  constructor() {
    this.#repo = new ListarRepositorio()
  }

  public async execute({ request }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      sigpq_situacao_estado_id: await this.validarNullOuUndefined(request, "sigpq_situacao_estado_id"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      sigpq_estado_id: await this.validarNullOuUndefined(request, 'sigpq_estado_id')
    }
    const result = await this.#repo.listarTodos(options)

    return ok(result, null);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
