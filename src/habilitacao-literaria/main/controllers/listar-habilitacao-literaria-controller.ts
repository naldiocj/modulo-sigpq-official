import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ListarhabilitacaoLiterariaRepositorio from '../../repositories/listar-habilitacao-literaria-repositorio'
import Logger from 'Config/winston';
import { getLogFormated } from 'Config/constants';

const { ok } = require('App/Helper/Http-helper');


export default class RegistarHabilitacaoLiterariaController {
  #repo
  constructor() {
    this.#repo = new ListarhabilitacaoLiterariaRepositorio()
  }

  public async execute({ request, auth }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc'
    } 
    
    const result = await this.#repo.listarTodos(options)

    const clientIp = request.ip();

    const { user }: any = auth;

    Logger.info(
      getLogFormated(user, "listar todos", "habilitações literárias"),
      {
        user_id: user.id,
        ip: clientIp,
      }
    );

    return ok(result, null);

  }

  async validarNullOuUndefined(request:any, field:any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
