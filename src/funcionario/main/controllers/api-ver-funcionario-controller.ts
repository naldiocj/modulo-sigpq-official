import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import verRepositorio from '../../repositories/api-ver-funcionario-repositorio'
import Logger from 'Config/winston';
import { getLogFormated } from 'Config/constants';

const { ok } = require('App/Helper/Http-helper');


export default class Controller {
  #repo
  constructor() {
    this.#repo = new verRepositorio()
  }

  public async execute({ params, request, auth, response }: HttpContextContract): Promise<any> {
    
    const result = await this.#repo.ver(params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    const clientIp = request.ip();

    const {user}: any = auth

    Logger.info(getLogFormated(user, "ver-execute", "funcionários"), {
      user_id: user.id,
      ip: clientIp,
    });

    return ok(result, null);

  }

  async validarNullOuUndefined(request:any, field:any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
