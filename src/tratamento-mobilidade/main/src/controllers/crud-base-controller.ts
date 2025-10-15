import ModuleInterfaceController from "App/Repositories/modulo/ModuleInterfaceController";

import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import CrudBaseRepositorio from "../../../repository/crud-base-repositorio";

const { ok } = require("App/Helper/Http-helper");
export default class Controller implements ModuleInterfaceController {
  #crud: any;
  constructor() {
    this.#crud = new CrudBaseRepositorio()
  }

  public async listarTodos({ auth, request }: HttpContextContract): Promise<any> {
    const { user, orgao }: any = auth.use('jwt')?.payload
    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      pessoajuridica_id: orgao?.id || null,
      orderByAscOrDesc: request.input("orderByAscOrDesc") || "asc",
      numero_guia: await this.validarNullOuUndefined(request, "numero_guia"),
      pessoafisica_id: user?.pessoa_id || null,
      sigpq_correspondencia_id: await this.validarNullOuUndefined(request, 'sigpq_correspondencia_id'),
      estado: await this.validarNullOuUndefined(request, 'estado')
    };

    const result = await this.#crud.listarTodos(options);

    return ok(result, null);
  }

  public async registar({
    auth,
    request,
    response
  }: HttpContextContract): Promise<any> {
    const input = {
      ...request.all(),
      user_id: auth.user?.id,
      pessoafisica_id: auth.user?.pessoa_id
    };

  
    const result = await this.#crud.registar(input);


    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null
      });
    }

    return ok(null, "Sucesso ao registar mobilidade!");
  }

  public async editar({
    params,
    auth,
    request,
    response
  }: HttpContextContract): Promise<any> {
    console.log(params, auth, request, response);
  }

  public async listarUm({ params,
    response }: HttpContextContract): Promise<any> {

    const result = await this.#crud.listarUm(params.id)

    if (result instanceof Error)
      return response.badGateway({
        message: result.message,
        object: null
      })

    return response.ok({
      message: '',
      object: result
    })
  }

  public async eliminar({
    params,
    response
  }: HttpContextContract): Promise<any> {
    const result = await this.#crud.listarUm(params.id)

    if (result instanceof Error)
      return response.badGateway({
        message: result.message,
        object: null
      })

    return response.ok({
      message: '',
      object: result
    })
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
