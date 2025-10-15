import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from './../../../../../../app/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-repositorio';

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud: CrudBaseRepository
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarUm({ params }: HttpContextContract): Promise<any> {
    const { id } = params
    const result = await this.#crud.listarUm(id)
    return ok(result, null);
  }

  public async listarTodos({ request, response }: HttpContextContract): Promise<any> {
    const filtro = {
      page: request.input("page"),
      perPage: request.input("perPage"),
      search: request.input("search"),
      pessoafisica_id: request.input("pessoafisicaId"),
      ordenar: request.input("orderByAscOrDesc") || 'asc'
    }



    const filtroLimpo = removeTextNullVariable(filtro)

    const result = await this.#crud.listarTodos(filtroLimpo)

    if(result instanceof Error){
      response.badRequest({
        message: result.message,
        result: null
      })
    }

    return ok(result, null);

  }

  public async registar({ auth, request, response }: any): Promise<any> {

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })

    const result = await this.#crud.registar(input, request)

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
    console.log(params, auth, request, response);
  }

  public async editarData({ params, auth, request, response }: HttpContextContract): Promise<any> {
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })


    const result = await this.#crud.editarData(input,params.id)

    if (result instanceof Error) {
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

  public async eliminar({ params, auth, response }: HttpContextContract): Promise<any> {
    const result = await this.#crud.delete(params.id, auth.user?.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(null, 'Função eliminado com sucesso!');

  }

}
