import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ListarRepository from '../../repositories/listar-repositorio';
import RedisService from 'App/@piips/shared/service/redis/RedisService';
import { funcaoCompoatilhada_limparFiltroCaptarSomenteQuemTiverValor } from '../../../../@core/helpers/funcoesCompartilhadas';
import StringHelper from 'App/Helper/String';
// import Event from '@ioc:Adonis/Core/Event'
import { saveFuncionarioInRedisDB } from '../../eventos/employee-eventos';

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper')

export default class Controller {
  #crud
  redis = new RedisService();
  stringHelper = new StringHelper()
  
  constructor() {
    this.#crud = new ListarRepository()
  }

  public async listarTodos({ auth, request, response }: HttpContextContract): Promise<any> {

    console.time('listarTodos');
    const { user, orgao, orgao_detalhes }: any = auth.use('jwt').payload

    //console.log("USER:",user,"DETALHES DO ÓRGÃO:",orgao_detalhes)

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }

    // const orgao = await this.#OrgaoRepo.findOrgaoDaPessoa(user?.pessoa_id)

    if (!orgao) {
      return response.badRequest({
        message: 'Este utilizador não está associado a um orgão',
        object: null,
      });
    }

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })

    const options = {
      page: input.page,
      perPage: input.perPage,
      search: await this.stringHelper.limparCaracterEmBranco(input.search),
      modulo_slug: input.modulo,
      regimeId: input.regimeId,
      patenteId: input.patenteId,
      tipoVinculoId: input.tipoVinculoId,
      tipoOrgaoId: input.tipoOrgaoId,
      orgaoId: input.orgaoId,
      estadoId: input.estadoId,
      situacaoId: input.situacaoId,
      idadeMenos: input.idadeMenos,
      idadeMais: input.idadeMais,
      anoMais: input.anoMais,
      anoMenos: input.anoMenos,
      genero: input.genero,
      orgao: orgao,
      aceder_todos_agentes: user.aceder_todos_agentes,
      aceder_departamento: user.aceder_departamento,
      aceder_seccao: user.aceder_seccao,
      aceder_posto_policial: user.aceder_posto_policial,
      dashboard: Boolean(input.dashboard),
      patenteClasse: input.patenteClasse,
      orderByAscOrDesc: input.orderByAscOrDesc || 'asc',
      forcaPassiva: input.forcaPassiva,
      sigpq_estado_reforma_id: input.sigpq_estado_reforma_id,
      sigpq_excluir_estado_reforma_id: input.sigpq_excluir_estado_reforma_id,
      orderby: input.orderby,
      funcao_id: input.funcao_id,
      excluir_efectividade_e_inactividade: input.excluir_efectividade_e_inactividade,
      sigpq_tipo_departamento: orgao_detalhes.sigpq_tipo_departamento,
      sigpq_tipo_seccao: orgao_detalhes.sigpq_tipo_seccao,
      sigpq_tipo_posto: orgao_detalhes.sigpq_tipo_posto
    }
    
    let result: any;

    const options_aux = funcaoCompoatilhada_limparFiltroCaptarSomenteQuemTiverValor(options);
    const funcionariokey = user.aceder_todos_agentes ? 'all' : orgao.id;

    try {
      // result = await this.redis.verificarSeExisteEArmazenaNoRedisNoFinalRetornaResultado('funcionario', funcionariokey, options_aux, this.#crud);

      
      result = await saveFuncionarioInRedisDB({key: funcionariokey, options});


      // if (result === undefined || result === null || result === "undefined") {
        result = await this.#crud.listarTodos(options_aux); 
      // }
    } catch (error) {
      result = await this.#crud.listarTodos(options_aux);
    }

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    console.timeEnd('listarTodos');
    return ok(result, null);
  }

}
