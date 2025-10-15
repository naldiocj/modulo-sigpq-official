import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ListarTodosRepository from '../../repositories/listar-todos-repositorio';

const { ok } = require('App/Helper/Http-helper');


export default class ListarTodosController {
  #repo: ListarTodosRepository
  constructor() {
    this.#repo = new ListarTodosRepository()
  }

  public async execute({ request, response }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      regime: await this.validarNullOuUndefined(request, "regime"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      sigpq_acto_progressao_id: await this.validarNullOuUndefined(request, 'sigpq_acto_progressao_id'),
      patenteId: await this.validarNullOuUndefined(request, 'patenteId'),
      patenteClasse: await this.validarNullOuUndefined(request, 'patenteClasse'),
      pessoa_id: await this.validarNullOuUndefined(request, 'pessoa_id')
    }
    const result = options.pessoa_id ? await this.#repo.listarTodos(options) : await this.#repo.listarOrdem(options)

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
