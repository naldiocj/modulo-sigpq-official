import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Repositorio from '../../repositories/listar-evento-por-estado-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class Controller {
  #repo
  constructor() {
    this.#repo = new Repositorio()
  }

  public async execute({ request }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      estado: await this.validarNullOuUndefined(request, "estado"),
      pessoafisica_id: Number(await this.validarNullOuUndefined(request, "pessoafisica_id")),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc'
    }

    const result = await this.#repo.listarTodos(options)

    return ok(result, null);

  }

  async validarNullOuUndefined(request:any, field:any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
