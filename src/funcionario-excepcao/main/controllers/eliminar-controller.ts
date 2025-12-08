import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import EliminarRepository from "../../repositories/eliminar-repository";
import Logger from "Config/winston";
import { getLogFormated } from "Config/constants";

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
    request
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

    const clientIp = request.ip();

    const {user}: any = auth

    Logger.info(getLogFormated(user, "eliminar", "funcionários em excepção"), {
      user_id: user.id,
      ip: clientIp,
    });

    return ok(result, null);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
