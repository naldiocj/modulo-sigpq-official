import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';
import CrudBaseRepositorios from '../../repositories/crud-base-repositorio';
const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud: CrudBaseRepositorios
  constructor() {
    this.#crud = new CrudBaseRepositorios()
  }

  public async listarTodos({ request, response, auth }: HttpContextContract): Promise<any> {
    const { user, orgao }: any = auth.use('jwt').payload

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      user, orgao,
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      pessoajuridica_id: await this.validarNullOuUndefined(request, "pessoajuridica_id"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      numero_guia: await this.validarNullOuUndefined(request, 'numero_guia'),
      tipoOrgaoId: await this.validarNullOuUndefined(request, 'tipoOrgaoId'),
      orgaoId: await this.validarNullOuUndefined(request, 'orgaoId'),

    }

    const result = await this.#crud.listarTodos(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null
      })
    }

    return ok(result, null);

  }

  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const orgaoDoNovoEfectivo=request.input('orgao_destino_id');
    const { user,orgao }: any = auth.use('jwt').payload
    const previlegioDoUsuariologado=user.aceder_todos_agentes ? 'all' : orgao.id;
    const input = removeTextNullVariable({
      ...request.all(),
      pessoajuridica_id: request.input('orgao_destino_id'),
      user_id: auth.user?.id
    })

    const result = await this.#crud.registar(input, request)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    // Event.emit('update:redis:in:search:funcionario', {
    //   orgaoNovo:orgaoDoNovoEfectivo,
    //   orgaoUsuarioLogado:previlegioDoUsuariologado,
    //   previlegio:previlegioDoUsuariologado
    // });
    return ok(null, 'Sucesso ao registar mobilidade!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    console.log(params, auth, request, response);
  }

   public async updateAprovaMobilidade({ params, auth, request, response }: HttpContextContract): Promise<any> {
 
    const result = await this.#crud.aprovaMobilidade(params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    // Event.emit('update:redis:in:search:funcionario', {
    //   orgaoNovo:orgaoDoNovoEfectivo,
    //   orgaoUsuarioLogado:previlegioDoUsuariologado,
    //   previlegio:previlegioDoUsuariologado
    // });
    return ok(null, 'Sucesso ao aprovar a mobilidade!');
  }

  public async listarUm({ params, request, response }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      pessoajuridica_id: await this.validarNullOuUndefined(request, "pessoajuridica_id"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      numero_guia: params.id,
    }


    const result = await this.#crud.listar(options)
    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null
      })
    }
    return ok(result, null);
  }

  public async eliminar({ auth, request, response }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
