import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudBaseRepository from '../../repositories/crud-base-repositorio';
import RedisService from 'App/@piips/shared/service/redis/RedisService';
import Event from '@ioc:Adonis/Core/Event'
import { funcaoCompoatilhada_limparFiltroCaptarSomenteQuemTiverValor } from '../../../../@core/helpers/funcoesCompartilhadas';
import { E } from '@faker-js/faker/dist/airline-DF6RqYmq';
 
const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper')
 
export default class Controller implements ModuleInterfaceController {
  #crud
  redis = new RedisService();
  constructor() {
    this.#crud = new CrudBaseRepository()
  }

  public async listarTodos({ auth, request, response }: HttpContextContract): Promise<any> {

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

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })

    console.log(input);
    
    const options = {
      page: input.page,
      perPage: input.perPage,
      search: input.search,
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
      excluir_efectividade_e_inactividade: input.excluir_efectividade_e_inactividade
    }

    let result: any;
    // this.redis.deleteAllData();
    const options_aux = funcaoCompoatilhada_limparFiltroCaptarSomenteQuemTiverValor(options);
    const funcionariokey = user.aceder_todos_agentes ? 'all' : orgao.id;

    try {
      result = await this.redis.verificarSeExisteEArmazenaNoRedisNoFinalRetornaResultado('funcionario', funcionariokey, options_aux, this.#crud);

      if (result === undefined || result === null || result === "undefined") {
        result = await this.#crud.listarTodos(options_aux); 
      }
    } catch (error) {
      result = await this.#crud.listarTodos(options_aux);
    }

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }


    return ok(result, null);

  }

  /*  async verificarSeExisteEArmazenaNoRedis(name: string, key: string, options: any, repository: any) {
     const hash = await generateCacheKey(options);
     const keyStorage = `search:${name}:orgao:${key}:hash:${hash}`;
 
     if (!await this.redis.retrieveHashField(keyStorage, 'results')) {
       console.log(`Pegando dados e inserindo no redis para a chave: ${keyStorage}`);
       const dados = await repository.listarTodos(options);
       await Promise.all([
          this.redis.storeHashField(keyStorage, 'results', JSON.stringify(dados)),
          this.redis.storeHashField(keyStorage, 'filters', options),
          this.redis.incrementAcesstoKey(`search:${name}:orgao:${key}:access_count`, keyStorage)
       ]);
 
       console.log("Dados salvos com sucesso");
     }
     const result=JSON.parse(await this.redis.retrieveHashField(keyStorage, 'results') ?? '{}');
     return result;
   } */



  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const orgaoDoNovoEfectivo = request.input('orgao_id');
    const { user, orgao }: any = auth.use('jwt').payload

    const previlegioDoUsuariologado = user.aceder_todos_agentes ? 'all' : orgao.id;

    //console.log(request.all())
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })

    const result = await this.#crud.registar(input, request)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    // Event.emit('update:redis:in:dashboard',
    //   {
    //     orgaoNovo: orgaoDoNovoEfectivo,
    //     orgaoUsuarioLogado: previlegioDoUsuariologado,
    //     previlegio: previlegioDoUsuariologado
    //   })

    // Event.emit('update:redis:in:search:funcionario', {
    //   orgaoNovo: orgaoDoNovoEfectivo,
    //   orgaoUsuarioLogado: orgao.id,
    //   previlegio: previlegioDoUsuariologado
    // });

    Event.emit('update:funcionario', result);
    // return ok({ pessoaId: null }, 'Sucesso ao registar Efectivo!');
    return ok({ pessoaId: result }, 'Sucesso ao registar Efectivo!');

  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })

    const { user, orgao }: any = auth.use('jwt').payload
    const previlegioDoUsuariologado = user.aceder_todos_agentes ? 'all' : orgao.id;
    const agenteParaSerAtualizado = await this.#crud.listarUm(params.id);

    const result = await this.#crud.editar(input, request, params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    if (result) {
      const agenteAtualizado = await this.#crud.listarUm(params.id);
      Event.emit('update:redis:in:funcionario', {
        orgaoNovo: agenteAtualizado.sigpq_tipo_orgao.id,
        orgaoUsuarioLogado: previlegioDoUsuariologado,
        previlegio: previlegioDoUsuariologado,
        dadosAntigoFuncionario: agenteParaSerAtualizado,
        dadosNovoFuncionario: agenteAtualizado,
      })
    }
    return ok(null, 'Sucesso ao actualizar Efectivo!');

  }

  public async listarUm({ params, response }: HttpContextContract): Promise<any> {
    const result = await this.#crud.listarUm(params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(result, null);
  }

  public async eliminar({ auth, params, request, response }: HttpContextContract): Promise<any> {

    const { id } = params
    const { user, orgao }: any = auth.use('jwt').payload
    const previlegioDoUsuariologado = user.aceder_todos_agentes ? 'all' : orgao.id;

    const agenteParaSerEliminado = await this.#crud.listarUm(id);
    const result = await this.#crud.eliminar(id);

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    // Verifica se a eliminação foi bem-sucedida
    if (result === 1) {
      Event.emit('update:redis:in:dashboard', {
        orgaoNovo: agenteParaSerEliminado.sigpq_tipo_orgao.id,
        orgaoUsuarioLogado: previlegioDoUsuariologado,
        previlegio: previlegioDoUsuariologado,
      });

      Event.emit('update:redis:in:dashboard_novo', {
        orgaoNovo: agenteParaSerEliminado.sigpq_tipo_orgao.id,
        orgaoUsuarioLogado: previlegioDoUsuariologado,
        previlegio: previlegioDoUsuariologado,
      });

      Event.emit('update:redis:in:search:funcionario', {
        orgaoNovo: agenteParaSerEliminado.sigpq_tipo_orgao.id,
        orgaoUsuarioLogado: previlegioDoUsuariologado,
        previlegio: previlegioDoUsuariologado
      });
    }

    return ok(null, 'Sucesso ao eliminar Efectivo!');
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }

  public async editarFoto({ auth, params, request, response }: HttpContextContract): Promise<any> {

    const { id } = params

    const input = {
      foto_efectivo: request.file('foto_efectivo'),
      foto_civil: request.file('foto_civil'),
      user_id: auth.user?.id
    }

    const result = await this.#crud.alterarFoto(Number(id), input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(null, 'Sucesso ao alterar a foto do agente!');

  }

  public async editarStado({ auth, params, request, response }: HttpContextContract): Promise<any> {
    const { id } = params


    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })
    const result = await this.#crud.editarStado(Number(id), input)
    const { user, orgao }: any = auth.use('jwt').payload
    const previlegioDoUsuariologado = user.aceder_todos_agentes ? 'all' : orgao.id;

    Event.emit('update:redis:in:search:funcionario', {
      orgaoNovo: orgao.id,
      orgaoUsuarioLogado: previlegioDoUsuariologado,
      previlegio: previlegioDoUsuariologado
    });

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(null, 'Sucesso ao alterar o estado do agente!');

  }
}
