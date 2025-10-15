import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Repository from '../../repositories/listar-todos-repository';


const { ok } = require('App/Helper/Http-helper');


export default class ListarTodosController {
  #repo
  constructor() {
    this.#repo = new Repository()
  }

  public async execute({ request, response }: HttpContextContract): Promise<any> {

    const options = { 
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      regime: await this.validarNullOuUndefined(request, "regime"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      pessoa_id: await this.validarNullOuUndefined(request, 'pessoa_id'),

      regimeId: await this.validarNullOuUndefined(request, 'regimeId'),
      patenteId: await this.validarNullOuUndefined(request, 'patenteId'),
      tipoVinculoId: await this.validarNullOuUndefined(request, 'tipoVinculoId'),
      tipoOrgaoId: await this.validarNullOuUndefined(request, 'tipoOrgaoId'),
      orgaoId: await this.validarNullOuUndefined(request, 'orgaoId'),
      genero: await this.validarNullOuUndefined(request, 'genero'),
      patenteClasse: await this.validarNullOuUndefined(request, 'patenteClasse'),
      orderby: await this.validarNullOuUndefined(request, 'orderby'),
      funcao_id: await this.validarNullOuUndefined(request, 'funcao_id')
    }
    const result = await this.#repo.execute(options)

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
