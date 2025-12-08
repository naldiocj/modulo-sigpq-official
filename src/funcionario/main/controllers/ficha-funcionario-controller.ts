import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import verFichaRepositorio from '../../repositories/ficha-funcionario-respositorio'
import Logger from 'Config/winston';
import { getLogFormated } from 'Config/constants';

const { ok } = require('App/Helper/Http-helper');


export default class Controller {
  #repo
  constructor() {
    this.#repo = new verFichaRepositorio()
  }

  public async execute({ params, auth, request, response }: HttpContextContract): Promise<any> {

    const result = await this.#repo.execute(params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    const clientIp = request.ip();

    const {user}: any = auth

    Logger.info(getLogFormated(user, "ver funcionário", "funcionários"), {
      user_id: user.id,
      ip: clientIp,
    });

    return ok(result, null);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
