import RedisService from 'App/@piips/shared/service/redis/RedisService';
import ListarNovaEstruturaRepository from '../../repositories/listar-repositorio-nova-estrutura';
const { ok } = require('App/Helper/Http-helper');

export default class Controller {
  #repo
  redis= new RedisService();
  constructor() {
    this.#repo = new ListarNovaEstruturaRepository()
  }

  public async executes({ auth, response }): Promise<any> {

    const authPayload = auth.use('jwt').payload;
    if (!authPayload) {
      return response.badRequest({
        message: 'Token inválido ou expirado',
        object: null,
      });
    }

    const { user, orgao, orgao_detalhes } = authPayload;

  
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
  

const departamentoId = orgao_detalhes.sigpq_tipo_departamento?.id || '';
const seccaoId = orgao_detalhes.sigpq_tipo_seccao?.id || '';
const postoId = orgao_detalhes.sigpq_tipo_posto?.id || '';

// Concatenação segura
const new_KeyDashboard = (orgao.id).toString() + departamentoId + seccaoId + postoId;

try {
  //await this.redis.deleteAllData()
 
  const dashboardKey =  options.user.aceder_todos_agentes ? 'all' :  new_KeyDashboard;
  
  result = await this.redis.verificarSeExisteEArmazenaNoRedisNoFinalRetornaResultado('dashboard_novo',dashboardKey,options,this.#repo,'dashboard_novo');
  } catch (error) {
    
    result = await this.#repo.listarTodos(options);
  }
    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }

  // Método auxiliar para evitar repetição de código
private async getSafeIdString(id:any) {
  return id != null ? id.toString() : "";
}



}



