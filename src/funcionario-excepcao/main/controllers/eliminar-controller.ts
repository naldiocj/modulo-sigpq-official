import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import EliminarRepository from "../../repositories/eliminar-repository";

const { ok } = require("App/Helper/Http-helper");

export default class Controller {
  #repo: EliminarRepository;
  constructor() {
    this.#repo = new EliminarRepository();
  }

  public async execute({
    params,
    auth,
    response,
  }: HttpContextContract): Promise<any> {
    const { pessoaId } = params;
    const user_id = auth.user?.id;
    const result = await this.#repo.execute(pessoaId, user_id);

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
