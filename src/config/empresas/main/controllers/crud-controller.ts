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
      pessoafisica_id: request.input("pessoafisica_id"),
      dia_selecionado: request.input("dia_selecionado"),
      licenca_aplicada: request.input("licenca_aplicada"),
      estado: request.input("estado"),
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
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }

    return ok(null, 'Sucesso ao registar Licenças para Funcionario!');
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
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }


    return ok(null, 'Sucesso ao atualizar Licenças de Funcionario!');
  }

  public async alterarSituacao({ auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(params, auth, request, response);
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1,
      situacao_made_by: auth.user?.id || 1
    })

    const result = await this.#crud.alterarSituacao(input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }


    return ok(null, 'Sucesso ao atualizar Licenças de Funcionario!');
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
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }

    return ok(null, 'Sucesso ao eliminar o Licenças de Funcionario!');

  }

}
