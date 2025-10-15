import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import AgenteOrgaoRepositorio from "../../repositories/listar-agente-orgao-repositorio";

const { ok } = require("App/Helper/Http-helper");

export default class ListarAgenteOrgaoController {
  #repo;
  constructor() {
    this.#repo = new AgenteOrgaoRepositorio();
  }

  public async execute({ request }: HttpContextContract): Promise<any> {
    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || "asc",
      pessoajuridica_id: await this.validarNullOuUndefined(
        request,
        "pessoajuridica_id"
      )
    };

    const result = await this.#repo.listarTodos(options);

    return ok(result, null);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
