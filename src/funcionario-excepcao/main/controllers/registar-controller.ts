import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Repository from "../../repositories/registar-repository";
import Logger from "Config/winston";
import { getLogFormated } from "Config/constants";

export default class Controller {
  #repo;
  constructor() {
    this.#repo = new Repository();
  }

  public async execute({
    auth,
    request,
    response,
  }: HttpContextContract): Promise<any> {
    const input = {
      ...request.all(),
      user_id: auth.user?.id,
    };

    const result = await this.#repo.execute(input);

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    const clientIp = request.ip();

    const { user }: any = auth;

    Logger.info(getLogFormated(user, "registar", "funcionários em excepção"), {
      user_id: user.id,
      ip: clientIp,
    });

    return response.ok({
      message: "Sucesso ao registar Evento!",
      object: null,
    });
  }
}
