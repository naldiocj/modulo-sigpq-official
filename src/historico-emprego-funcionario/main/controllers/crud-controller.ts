import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-base-repositorio';
import Logger from 'Config/winston';
import { getLogFormated } from 'Config/constants';

const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarTodos({ request, auth }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      pessoafisica_id: await this.validarNullOuUndefined(request, "pessoafisica_id"),
      tipo_empresa_id: await this.validarNullOuUndefined(request, "tipo_empresa_id"),
    }

    const result = await this.#crud.listarTodos(options)

     const clientIp = request.ip();

    const { user }: any = auth;

    Logger.info(
      getLogFormated(user, "listar todos", "histórico de empregos do funcionário"),
      {
        user_id: user.id,
        ip: clientIp,
      }
    );

    return ok(result, null);

  }

  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const input = {
      ...request.all(),
      user_id: auth.user?.id
    }

    const result = await this.#crud.registar(input, request);

    if (result instanceof Error)
      return response.badRequest({
        message: result.message,
        object: null,
      });

      const clientIp = request.ip();

    const { user }: any = auth;

    Logger.info(
      getLogFormated(user, "registar", "histórico de empregos do funcionário"),
      {
        user_id: user.id,
        ip: clientIp,
      }
    );

    return ok(null, 'Sucesso ao registar Outros Empregos!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    const input = {
      ...request.all(),
      user_id: auth.user?.id
    }

    const result = await this.#crud.editar(params.id, input, request);

    if (result instanceof Error)
      return response.badRequest({
        message: result.message,
        object: null,
      });
    
      const clientIp = request.ip();

    const { user }: any = auth;

    Logger.info(
      getLogFormated(user, "editar", "histórico de empregos do funcionário"),
      {
        user_id: user.id,
        ip: clientIp,
      }
    );

    return ok(null, 'Sucesso ao registar Outros Empregos!');
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
