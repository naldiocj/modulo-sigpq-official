import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-base-repositorio';

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper');

export default class Controller implements ModuleInterfaceController {
  #crud: CrudBaseRepository
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarTodos({ request }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      pessoafisica: 1,
      tipo: await this.validarNullOuUndefined(request, "tipo"),
    }

    const result = await this.#crud.listarTodos(options)

    return ok(result, null);

  }

  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.['id']
    })

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

    return ok(null, 'Sucesso ao registar historico para funcionario!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.['id']
    })

    const { id } = params



    const result = await this.#crud.editar(input, id)

    if (result instanceof Error)
      return response.badRequest({
        message: result.message,
        object: null,
      });

    return ok(null, 'Sucesso ao editar historico para funcionario!');

  }

  public async listarUm({ params }: HttpContextContract): Promise<any> {
    const { id } = params
    const result = await this.#crud.listarUm(id)
    return ok(result, null);
  }

  public async eliminar({ params, auth, response }: HttpContextContract): Promise<any> {

    const result = await this.#crud.delete(params.id, null, auth.user?.id)

    if (result instanceof Error)
      return response.badRequest({
        message: result.message,
        object: null,
      });

    return ok(null, 'Sucesso ao eliminar historico para funcionario!');

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
