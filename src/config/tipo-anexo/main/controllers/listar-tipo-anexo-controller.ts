import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ListarTipoAnexoRepositorio from '../../repositories/listar-tipo-anexo-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class RegistarTipoAnexoController {
  #repo
  constructor() {
    this.#repo = new ListarTipoAnexoRepositorio()
  }

  public async execute({ request }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc'
    } 
    
    const result = await this.#repo.listarTodos(options)

    return ok(result, null);

  }

  async validarNullOuUndefined(request:any, field:any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
