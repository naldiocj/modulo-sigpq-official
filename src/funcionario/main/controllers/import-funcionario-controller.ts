import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import RedisService from 'App/@piips/shared/service/redis/RedisService';
import StringHelper from 'App/Helper/String';
// import Event from '@ioc:Adonis/Core/Event'
import Logger from 'Config/winston';
import { getLogFormated } from 'Config/constants';


const { ok } = require('App/Helper/Http-helper')

export default class Controller {
  redis = new RedisService();
  stringHelper = new StringHelper()
  constructor() {
  }

  public async execute({ auth, request, response }: HttpContextContract): Promise<any> {

    const { user, orgao }: any = auth.use('jwt').payload

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }

    if (!orgao) {
      return response.badRequest({
        message: 'Este utilizador não está associado a um orgão',
        object: null,
      });
    }

    let result = 200;

    try {

      const clientIp = request.ip()

      Logger.info(getLogFormated(user, 'a listagem', 'funcionários'), {
        user_id: user.id,
        ip: clientIp
      })



      const repository = new (await import('../../repositories/import-funcionario-repositorio')).default()
      const importResult = await repository.importCsv()

      if (importResult instanceof Error) {
        return response.badRequest({
          message: importResult.message,
          object: null,
        });
      }

      result = 200;

      return ok(result, {
        message: 'Importação concluída com sucesso',
        registrosImportados: importResult.length,
      });
    } catch (e) {
      console.log(e);

      return response.internalServerError({
        message: 'Erro interno do servidor',
        object: null,
      });
    }
  }
}
