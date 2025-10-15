import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';

import CrudLicencaRepository from '../../repositories/crud-repositorio';
import { funcaoCompoatilhada_limparFiltroCaptarSomenteQuemTiverValor } from '../../../../../@core/helpers/funcoesCompartilhadas';

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud
  constructor() {
    this.#crud = new CrudLicencaRepository()
  }

  public async listarUm({ auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(auth, request, response);
    return request
  }

  public async listarTodos({ request }: HttpContextContract): Promise<any> {
    const filtro = {
      page: request.input("page"),
      perPage: request.input("perPage"),
      search: request.input("search"),
      pessoafisica_id: request.input("pessoafisica_id"),
      dia_selecionado: request.input("dia_selecionado"),
      tipo_licenca_id: request.input("tipo_licenca_id"),
      estado: request.input("estado"),
    }
    const filtroLimpo = removeTextNullVariable(filtro)

    const result = await this.#crud.listarTodos(filtroLimpo)

    return ok(result, null);

  }

  public async listarTodasFerias({ request }: HttpContextContract): Promise<any> {
    const filtro = {
      page: request.input("page"),
      perPage: request.input("perPage"),
      search: request.input("search"),
      pessoafisica_id: request.input("pessoafisica_id"),
      dia_selecionado: request.input("dia_selecionado"),
      ano: request.input("ano"),
      mes: request.input("mes"),
      tipo_licenca_id: request.input("tipo_licenca_id"),
      estado: request.input("estado"),
    }

    const filtroLimpo = removeTextNullVariable(filtro)

    const result = await this.#crud.listarTodasFerias(filtroLimpo)

    return ok(result, null);

  }

  public async listarTodos_ComPessoas_E_Licencas({ auth, request, response }: HttpContextContract): Promise<any> {
    
    const { user, orgao }: any = auth.use('jwt').payload

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
      licenca_disciplinar: input.licenca_disciplinar,
      
      situacao_do_dia_da_licenca: request.input("situacao_do_dia_da_licenca"),
      //orgao: orgao,
      aceder_todos_agentes: user.aceder_todos_agentes,
      //dashboard: Boolean(input.dashboard),
      patenteClasse: input.patenteClasse,
      orderByAscOrDesc: input.orderByAscOrDesc || 'asc',
      forcaPassiva: input.forcaPassiva,
      pessoafisica_id: request.input("pessoafisica_id"),
      dia_selecionado: request.input("dia_selecionado"),
      ano: input.ano,
      mes: input.mes,
      tipo_licenca_id: input.tipo_licenca_id,
      estado: request.input("estado"),
    }
    const filtroLimpo=funcaoCompoatilhada_limparFiltroCaptarSomenteQuemTiverValor(options);
    const result = await this.#crud.listarTodos_ComPessoas_E_Licencas(filtroLimpo)

    return ok(result, null);
  }


  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1
    })

    const result = await this.#crud.registar(input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }

    return ok(null, 'Sucesso ao registar Licenças para Funcionario!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(params, auth, request, response);
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1
    })

    const result = await this.#crud.editar(params.id,input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }


    return ok(null, 'Sucesso ao atualizar Licenças de Funcionario!');
  }

  public async enviar_detalhe_para_licenca_ano_mes({ params, auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(params, auth, request, response);
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1
    })

    const result = await this.#crud.enviar_detalhe_para_licenca_ano_mes(input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }


    return ok(null, 'Sucesso ao atualizar Resposta ou Informações ao seu Pedido!');
  }
  public async saberDiasDeFerias({auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(params, auth, request, response);
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1
    })
    const result = await this.#crud.saberDiasDeFerias(input)

    return ok(result, null);

  }

  public async pegarDadosDaLicenca_Ano_mes({auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(params, auth, request, response);
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1
    })
    const result = await this.#crud.pegarDadosDaLicenca_Ano_mes(input)

    return ok(result, null);

  }

  public async alterarSituacao({ auth, request, response }: HttpContextContract): Promise<any> {
    //console.log(params, auth, request, response);
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id || 1,
      situacao_made_by: auth.user?.id || 1
    })

    const result = await this.#crud.alterarSituacao(input)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }


    return ok(null, 'Sucesso ao atualizar Licenças de Funcionario!');
  }

  public async eliminar({ params,auth, request, response }: HttpContextContract): Promise<any> {
    const result = await this.#crud.delete(params.id,auth)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Licenças para Funcionario",
      //   event: "Licenças para Funcionario registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Licenças para Funcionario registado com sucesso!",
      // });
    }

    return ok(null, 'Sucesso ao eliminar o Licenças de Funcionario!');

  }

}
