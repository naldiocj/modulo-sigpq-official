import RedisService from 'App/@piips/shared/service/redis/RedisService';
import ListarRepository from '../../repositories/listar-repositorio'
import { qualOrgaoSelecionar } from '../../../../@core/helpers/funcoesCompartilhadas';
const { ok } = require('App/Helper/Http-helper');

export default class Controller {
  #repo
  redis= new RedisService();
  constructor() {
    this.#repo = new ListarRepository()
  }

  public async execute({ auth, response }): Promise<any> {

    const { user, orgao,orgao_detalhes } = auth.use('jwt').payload

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }

    const options = {
      user,
      orgao,
      orgao_detalhes
    }

    let result:any;



try {
  //await this.redis.deleteAllData()
  const dashboardKey =  options.user.aceder_todos_agentes ? 'all' : orgao.id;
  result = await this.redis.verificarSeExisteEArmazenaNoRedisNoFinalRetornaResultado('dashboard',dashboardKey,options,this.#repo,'dashboard');
  } catch (error) {
    result = await this.#repo.listarTodos(options);
  }
  //console.log("Dados da dahsboard:",options)
    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }



}



