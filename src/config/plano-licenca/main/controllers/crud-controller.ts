import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-repositorio';

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarUm({ auth, request, response }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);
  }

  public async listarTodos({ request }: HttpContextContract): Promise<any> {

    const filtro = {
      page: request.input("page"),
      perPage: request.input("perPage"),
      search: request.input("search"),
      modulo_slug: request.input("modulo"),
      ordenar: request.input("orderByAscOrDesc") || 'asc'
    }

    const filtroLimpo = removeTextNullVariable(filtro)

    const result = await this.#crud.listarTodos(filtroLimpo)

    return ok(result, null);

  }

  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1
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
      //   auditable: "Tipo Licença",
      //   event: "Tipo Licença registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Tipo Licença registado com sucesso!",
      // });
    }

    return ok(null, 'Sucesso ao registar Tipo Licença!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(params, auth, request, response);
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1
    })

    const result = await this.#crud.editar(params.id,input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(null, 'Sucesso ao atualizar Tipo Licença!');
  }

  public async alterarStadoActivo({ params, auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(params, auth, request, response);
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1
    })

    const result = await this.#crud.alterarStadoActivo(params.id,input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(null, 'Sucesso ao atualizar Tipo Licença!');
  }

  public async eliminar({ params,auth, request, response }: HttpContextContract): Promise<any> {
    const result = await this.#crud.delete(params.id,auth)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Tipo Licença",
      //   event: "Tipo Licença registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Tipo Licença registado com sucesso!",
      // });
    }

    return ok(null, 'Sucesso ao eliminar o Tipo Licença!');

  }

}
