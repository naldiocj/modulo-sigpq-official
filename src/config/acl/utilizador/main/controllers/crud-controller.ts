import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-repositorio';

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud: CrudBaseRepository
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarUm({ auth, request, response }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);
  }

  public async listarTodos({ auth,request }: HttpContextContract): Promise<any> {
    const filtro = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      moduloId: await this.validarNullOuUndefined(request, "moduloId"),
      estado: await this.validarNullOuUndefined(request, "estado"),
      orgaoId: await this.validarNullOuUndefined(request, "orgaoId"),
      ordenar: request.input("orderByAscOrDesc") || 'asc'
    }

    const filtroLimpo = removeTextNullVariable(filtro)


    const result = await this.#crud.listarTodos(filtroLimpo)

    return ok(result, null);

  }

  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
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

    return ok(null, 'Sucesso ao registar Utilizador!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })
    const { id } = params

    const result = await this.#crud.editar(input, id)
    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(null, 'Sucesso ao editar Utilizador!');
  }

  public async eliminar({ auth, params, response }: HttpContextContract): Promise<any> {

    const user_id = auth?.user?.id
    const { id } = params
    const result = await this.#crud.eliminar(id, user_id)

    if (result instanceof Error) {
      return response.badRequest({
        object: null,
        message: result.message
      })
    }
    return ok(null, 'Sucesso ao eliminar Utilizador')

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
