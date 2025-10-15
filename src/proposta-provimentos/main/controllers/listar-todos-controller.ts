import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ListarTodosRepository from '../../repositories/listar-todos-repositorio';

const { ok } = require('App/Helper/Http-helper');


export default class ListarTodosController {
  #repo
  constructor() {
    this.#repo = new ListarTodosRepository()
  }

  public async execute({ auth, request, response }: HttpContextContract): Promise<any> {
    const { user, orgao }: any = auth.use('jwt').payload

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      user, orgao,
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      pessoajuridica_id: await this.validarNullOuUndefined(request, "pessoajuridica_id"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      numero: await this.validarNullOuUndefined(request, 'numero'),
      tipoOrgaoId: await this.validarNullOuUndefined(request, 'tipoOrgaoId'),
      orgaoId: await this.validarNullOuUndefined(request, 'orgaoId'),

    }
    const result = await this.#repo.listarTodos(options)

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
