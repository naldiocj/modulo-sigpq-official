import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-base-repositorio';

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

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
      tipo_orgao: request.input('tipo_orgao') || null,
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      pessoafisica: await this.validarNullOuUndefined(request, 'pessoafisica'),
      minha_pessoajuridica_id: await this.validarNullOuUndefined(request, 'minha_pessoajuridica_id'),
      tipo_estrutura_sigla: await this.validarNullOuUndefined(request, 'tipo_estrutura_sigla'),
      pessoajuridica_id: Number(await this.validarNullOuUndefined(request, 'pessoajuridica_id')) || null
    }

    const result = await this.#crud.listarTodos(options)

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

    return ok(null, 'Sucesso ao registar Entidade!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })

    const result = await this.#crud.editar(params?.id, input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(null, 'Sucesso ao editar Entidade!');
  }

  public async listarUm({ params, response }: HttpContextContract): Promise<any> {

    const result = await this.#crud.listarUm(params.id)

    if (result instanceof Error)
      return response.badGateway({
        message: result.message,
        object: null
      })


    return response.ok({
      object: result,
      message: ''
    })
  }

  public async eliminar({ auth, request, response }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
