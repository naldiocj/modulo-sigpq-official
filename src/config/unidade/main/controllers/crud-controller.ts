import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-base-repositorio';

const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarTodos({ request }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      entidade: await this.validarNullOuUndefined(request, "entidade"),
      departamentoId: await this.validarNullOuUndefined(request, "departamentoId"),
      orgaoId: await this.validarNullOuUndefined(request, "orgaoId"),
      tipoOrgao: await this.validarNullOuUndefined(request, "tipoOrgao"),
      seccaoId: await this.validarNullOuUndefined(request, "seccaoId"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
    }

    const result = await this.#crud.listarTodos(options)

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
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Utilizador",
      //   event: "Utilizador registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Utilizador registado com sucesso!",
      // });
    }

    return ok(null, 'Sucesso ao registar Secção!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    const input = {
      ...request.all(),
      user_id: auth.user?.id
    }

    const result = await this.#crud.editar(params.id, input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Utilizador",
      //   event: "Utilizador registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Utilizador registado com sucesso!",
      // });
    }
    return ok(null, 'Sucesso ao editar Secção!');
  }

  public async listarUm({ auth, request, response }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);
  }

  public async eliminar({ auth, request, response }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
