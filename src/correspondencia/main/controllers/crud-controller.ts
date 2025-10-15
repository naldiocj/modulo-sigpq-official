import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ModuleInterfaceController from 'App/Repositories/modulo/ModuleInterfaceController';
import CrudRepository from '../../repoositorio/crud-respositorio';


const { ok } = require('App/Helper/Http-helper');


export default class Controller implements ModuleInterfaceController {
  #crud
  constructor() {
    this.#crud = new CrudRepository()
  }

  public async listarTodos({ request, response }: HttpContextContract): Promise<any> {

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      remtente_id: await this.validarNullOuUndefined(request, "remetente_id"),
      enviado_para: await this.validarNullOuUndefined(request, "enviado_para"),
      departamento_id: await this.validarNullOuUndefined(request, "departamentoId"),
      // orgao_id: await this.validarNullOuUndefined(request, "orgaoId"),
      estado_id: await this.validarNullOuUndefined(request, "estadoId"),
      importancia_id: await this.validarNullOuUndefined(request, "importanciaId"),
      natureza_id: await this.validarNullOuUndefined(request, "naturezaId"),
      tipo_id: await this.validarNullOuUndefined(request, "tipoId"),

    }
   
    const result = await this.#crud.listarTodos(options)
    
    if(result instanceof Error){
        return response.badRequest({
            message: result.message,
            result: null
        })
    }
    
    
    return ok(result, null);

  }

  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

    const input = {
      ...request.all(),
      user_id: auth.user?.id
    }

    const result = await this.#crud.registar(input, request);
    
    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } 

    return ok(null, 'Sucesso ao enviar correspondencia!');
  }

  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    console.log(params, auth, request, response);
  }

  public async listarUm({ params, response }: HttpContextContract): Promise<any> {
   
      const result = await this.#crud.listarUm(params.id)
      
      if(result instanceof Error){
          return response.badRequest({
              message: result.message,
              result: null
          })
      }
      
      
      return ok(result, null);
  
  }

  public async eliminar({ auth, request, response }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);

  }

  async validarNullOuUndefined(request:any, field:any) {
    return ['null', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
