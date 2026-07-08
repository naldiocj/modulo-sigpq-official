import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ListarUmPorOrdemRepository from "../../repositories/listar-um-por-ordem-repositorio";
import { useLogger } from "App/Helper/logger";

const { ok } = require("App/Helper/Http-helper");

export default class ListarUmPorOrdemController {
  #repo: ListarUmPorOrdemRepository;
  constructor() {
    this.#repo = new ListarUmPorOrdemRepository();
  }

  public async execute({
    request,
    response,
    auth,
  }: HttpContextContract): Promise<any> {
    const options = {
      numero: await this.validarNullOuUndefined(request, "numero"),
    };

    const result = await this.#repo.execute(options.numero);

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    useLogger(request, auth, "listar um por ordem", "provimentos");

    return ok(result, null);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
