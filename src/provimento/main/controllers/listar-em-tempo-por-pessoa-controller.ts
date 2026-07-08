import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import ListarEmTempoRepositorio from "../../repositories/listar-em-tempo-repositorio";
import { useLogger } from "App/Helper/logger";

const { ok } = require("App/Helper/Http-helper");

export default class ListarEmTempoController {
  #repo: ListarEmTempoRepositorio;
  constructor() {
    this.#repo = new ListarEmTempoRepositorio();
  }

  public async execute({
    params,
    response,
    request,
    auth
  }: HttpContextContract): Promise<any> {
    const result = await this.#repo.listarPorPessoa(params.pessoaId);

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    useLogger(request, auth, "listar em tempo por pessoa", "provimentos");

    return ok(result, null);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
