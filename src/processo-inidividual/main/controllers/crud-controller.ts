import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import ModuleInterfaceController from "App/Repositories/modulo/ModuleInterfaceController";

import CrudBaseRepository from "../../repositories/crud-base-repositorio";
import Logger from "Config/winston";
import { getLogFormated } from "Config/constants";
import { useLogger } from "App/Helper/logger";

const { ok } = require("App/Helper/Http-helper");

export default class Controller implements ModuleInterfaceController {
  #crud;
  constructor() {
    this.#crud = new CrudBaseRepository();
  }

  public async listarTodos({
    request,
    auth,
  }: HttpContextContract): Promise<any> {
    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || "asc",
      pessoafisica_id: await this.validarNullOuUndefined(
        request,
        "pessoafisica_id"
      ),
      activo: await this.validarNullOuUndefined(request, "activo"),
    };

    const result = await this.#crud.listarTodos(options);

    const { user } = auth;

    const clientIp = request.ip();

    Logger.info(getLogFormated(user, "listar todas", "mobilidades"), {
      user_id: user?.id,
      ip: clientIp,
    });

    return ok(result, null);
  }

  public async activo({
    params,
    auth,
    request,
    response,
  }: HttpContextContract): Promise<any> {
    const input = {
      ...request.all(),
      user_id: auth.user?.id,
    };

    const result = await this.#crud.activo(params.id, input);

    if (result instanceof Error)
      return response.badRequest({
        message: result.message,
        object: null,
      });

    const clientIp = request.ip();

    const { user } = auth;

    Logger.info(getLogFormated(user, "activo", "mobilidades"), {
      user_id: user?.id,
      ip: clientIp,
    });

    return ok(null, "Sucesso ao Atualziar Estado!");
  }

  public async registar({
    auth,
    request,
    response,
  }: HttpContextContract): Promise<any> {
    const input = {
      ...request.all(),
      user_id: auth.user?.id,
    };

    const result = await this.#crud.registar(input, request);

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Utilizador",
      //   event: "Utilizador registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Utilizador registado com sucesso!",
      // });
    }

    useLogger(request, auth, "resgistar", "mobilidades");

    return ok(null, "Sucesso ao registar Departamento!");
  }

  public async editar({
    params,
    auth,
    request,
    response,
  }: HttpContextContract): Promise<any> {
    const input = {
      ...request.all(),
      user_id: auth.user?.id,
    };

    const result = await this.#crud.editar(params.id, input, request);

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    } else {
      // this.logger.dispash({
      //   user: (await auth.getUser()).toJSON(),
      //   auditable: "Utilizador",
      //   event: "Utilizador registado",
      //   request,
      //   data: {
      //     result
      //   },
      //   message: "Utilizador registado com sucesso!",
      // });
    }

    useLogger(request, auth, "editar", "mobilidades");

    return ok(null, "Sucesso ao editar processo individual!");
  }

  public async listarUm({
    auth,
    request,
    response,
  }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);
  }

  public async eliminar({
    auth,
    request,
    response,
  }: HttpContextContract): Promise<any> {
    console.log(auth, request, response);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
