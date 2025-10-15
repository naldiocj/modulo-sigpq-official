import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ContactoRepositorio from '../../repositories/listar-contacto-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class ListarContactoController {
  #repo
  constructor() {
    this.#repo = new ContactoRepositorio()
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
