import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-base-repositorio';

const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud: CrudBaseRepository
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarTodos({ request, response }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      pessoajuridica_id: await this.validarNullOuUndefined(request, "pessoajuridica_id"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      pessoafisica_id: await this.validarNullOuUndefined(request, "pessoafisica_id"),

      patente_id: await this.validarNullOuUndefined(request, "patenteId"),

      patenteClasse: await this.validarNullOuUndefined(request, "patenteClasse"),
      tipoVinculoId: await this.validarNullOuUndefined(request, "tipoVinculoId"),
      orgaoId: await this.validarNullOuUndefined(request, "orgaoId"),
      genero: await this.validarNullOuUndefined(request, "genero"),
      regimeId: await this.validarNullOuUndefined(request, "regimeId"),

    }

    const result = await this.#crud.listarTodos(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(result, null);


  }

  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const input = {
      ...request.all(),
      user_id: auth.user?.id
    }
    const result = await this.#crud.registar(input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(null, 'Sucesso ao emitir guia!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    console.log(params, auth, request, response);
  }

  public async listarUm({ params, request, response }: HttpContextContract): Promise<any> {



    const result = await this.#crud.listarUm(params.id)
    return ok(result, null);
  }

  public async eliminar({ auth, request, response }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
