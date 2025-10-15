import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ListarPorModuloRepositorio from '../../repositories/listar-por-modulo-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class ListarPorModuloController {
  #repo
  constructor() {
    this.#repo = new ListarPorModuloRepositorio()
  }

  public async execute({ params, request }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_id: params.id || null,
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc'
    } 
    
    const result = await this.#repo.listarTodos(options)

    return ok(result, null);

  }

  async validarNullOuUndefined(request:any, field:any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
