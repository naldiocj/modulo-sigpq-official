import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CrudBaseRepositorios from '../../repositories/crud-base-repositorio';

const { ok } = require('App/Helper/Http-helper');


export default class Controller {
  #crud:CrudBaseRepositorios
  constructor() {
    this.#crud = new CrudBaseRepositorios()
  }

  public async execute({ request }: HttpContextContract): Promise<any> {
    const options = {
        page: await this.validarNullOuUndefined(request, "page"),
        perPage: await this.validarNullOuUndefined(request, "perPage"),
        search: await this.validarNullOuUndefined(request, "search"),
        pessoajuridica_id: await this.validarNullOuUndefined(request, "pessoajuridica_id"),
        orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
        numero_guia: await this.validarNullOuUndefined(request, 'numero_guia'),
        pessoafisica_id: await this.validarNullOuUndefined(request, "pessoafisica_id")
      }
    const result = await this.#crud.listarTodosPorPessoa(options)

    return ok(result, null);

  }

  public async editarData({ params, auth, request, response }: HttpContextContract): Promise<any> {
    /* const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    }) */

    const result = await this.#crud.editarData(request.all(),params.id)

    if (result instanceof Error) {
      console.log(result)
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return response.ok({
      message: 'Sucesso ao atualizardata de cargo!',
      object: null,
    });
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }


}
