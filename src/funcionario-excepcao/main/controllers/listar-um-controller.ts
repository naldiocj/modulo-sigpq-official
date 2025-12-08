import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Repository from "../../repositories/listar-todos-repository";
import Logger from "Config/winston";
import { getLogFormated } from "Config/constants";

const { ok } = require("App/Helper/Http-helper");

export default class Controller {
  #repo;
  constructor() {
    this.#repo = new Repository();
  }

  public async execute({ request, auth }: HttpContextContract): Promise<any> {
    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      pessoafisica_id: Number(
        await this.validarNullOuUndefined(request, "pessoafisica_id")
      ),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || "asc",
    };

    const result = await this.#repo.listarTodos(options);

    const clientIp = request.ip();

    const { user }: any = auth;

    Logger.info(
      getLogFormated(user, "listar um", "funcionários em excepção"),
      {
        user_id: user.id,
        ip: clientIp,
      }
    );

    return ok(result, null);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
