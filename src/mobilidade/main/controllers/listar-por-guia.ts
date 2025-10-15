import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CrudBaseRepositorios from '../../repositories/crud-base-repositorio';

const { ok } = require('App/Helper/Http-helper');


export default class Controller {
  #crud: CrudBaseRepositorios
  constructor() {
    this.#crud = new CrudBaseRepositorios()
  }

  public async execute({ request, response, auth }: HttpContextContract): Promise<any> {

    const { user, orgao }: any = auth.use('jwt').payload

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }


    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      user, orgao,
      numero_guia: await this.validarNullOuUndefined(request, 'numero_guia'),
      regimeId: await this.validarNullOuUndefined(request, 'regimeId'),
      patenteId: await this.validarNullOuUndefined(request, 'patenteId'),
      patenteClasse: await this.validarNullOuUndefined(request, 'patenteClasse'),
      tipoVinculoId: await this.validarNullOuUndefined(request, 'tipoVinculoId'),
      situacaoId: await this.validarNullOuUndefined(request, 'situacaoId'),
      estadoId: await this.validarNullOuUndefined(request, 'estadoId'),
      tipoOrgaoId: await this.validarNullOuUndefined(request, 'tipoOrgaoId'),
      orgaoId: await this.validarNullOuUndefined(request, 'orgaoId'),
      genero: await this.validarNullOuUndefined(request, 'genero'),
    }

    const result = await this.#crud.listar(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', '0', undefined, 'undefined'].includes(request.input(field)) ? null : request.input(field);
  }


}
