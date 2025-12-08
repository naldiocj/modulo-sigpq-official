import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Repository from '../../repositories/listar-todos-repository';
import Logger from 'Config/winston';
import { getLogFormated } from 'Config/constants';


const { ok } = require('App/Helper/Http-helper');


export default class ListarTodosController {
  #repo
  constructor() {
    this.#repo = new Repository()
  }

  public async execute({ request, response, auth }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      regime: await this.validarNullOuUndefined(request, "regime"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      pessoa_id: await this.validarNullOuUndefined(request, 'pessoa_id')
    }
    const result = await this.#repo.execute(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message, 
        object: null,
      });
    }

    const clientIp = request.ip();

    const {user}: any = auth

    Logger.info(getLogFormated(user, "listar todos", "funcionários em excepção"), {
      user_id: user.id,
      ip: clientIp,
    });

    return ok(result, null);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
