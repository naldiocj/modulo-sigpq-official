import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ListarPorPessoaRepository from "../../repositories/listar-por-pessoa-repository";

const { ok } = require("App/Helper/Http-helper");

export default class Controller {
  #repo: ListarPorPessoaRepository;
  constructor() {
    this.#repo = new ListarPorPessoaRepository();
  }

  public async execute({
    params,
    response,
  }: HttpContextContract): Promise<any> {
    const { pessoa_id } = params;
    const result = await this.#repo.execute(pessoa_id, false);

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(result, null);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
