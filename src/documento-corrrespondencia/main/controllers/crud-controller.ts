import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import ModuleInterfaceController from "App/Repositories/modulo/ModuleInterfaceController";
import CorrespondenciaDocumentoRepository from '../../repositories/crud-base-repositorio';




const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper');

export default class Controller implements ModuleInterfaceController {
  #crud: CorrespondenciaDocumentoRepository
  constructor() {
    this.#crud = new  CorrespondenciaDocumentoRepository()
  }

  public async listarUm({ params, response }: HttpContextContract): Promise<any> {

    const result = await this.#crud.listarUm(params.id)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null
      })
    }

    return response.ok({
      message: '',
      object: result
    })

  }

  public async listarTodos({ request, response }: HttpContextContract): Promise<any> {

    const filtro = {
      page: request.input("page"),
      perPage: request.input("perPage"),
      search: request.input("search"),
      modulo_slug: request.input("modulo"),
      ordenar: request.input("orderByAscOrDesc") || 'asc',
      porpna_candidato_id: request.input('porpna_candidato_id'),
      nome: request.input('nome'),

    }

    const filtroLimpo = removeTextNullVariable(filtro)

    const result = await this.#crud.listarTodos(filtroLimpo)

    if (result instanceof Error)
      return response.badRequest({
        message: result.message,
        result: null
      })

    return ok(result, null);

  }

  public async registar({ auth, request, response }: HttpContextContract): Promise<any> {

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

    return ok(null, 'Sucesso ao candidar-se!');
  }


  public async editar({ params, auth, request, response }: HttpContextContract): Promise<any> {
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id
    })

    // const result = await this.#crud.editar(input, params.id)

    // if (result instanceof Error) {

    //   return response.badRequest({
    //     message: result.message,
    //     object: null,
    //   });

    // }

    // return ok(null, 'Sucesso na actualizacção do ramo das FAA!');
  }

  public async eliminar({ params, auth, response }: HttpContextContract): Promise<any> {

    console.log(params, auth, response)

    // const result = await this.#crud.eliminar(params.id, auth.user?.id)


    // if (result instanceof Error) {
    //   return response.badGateway({
    //     message: result.message,
    //     object: null
    //   })
    // }
    // return ok(null, 'Sucesso na eliminar ramo das FAA')
  }


}
