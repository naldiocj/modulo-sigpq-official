import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import ListarRepositorio from "../../repositories/listar-repositorio";

const { ok } = require("App/Helper/Http-helper");

export default class ListarController {
  #repo:ListarRepositorio
  constructor() {
    this.#repo = new ListarRepositorio();
  }

  public async execute({ request }: HttpContextContract): Promise<any> {
    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || "asc",
      classeAcima: await this.validarNullOuUndefined(request, "classeAcima"),
      classeAbaixo: await this.validarNullOuUndefined(request, "classeAbaixo"),
    };
    const result = await this.#repo.listarTodos(options);

    return ok(result, null);
  }

  async validarNullOuUndefined(request: any, field: any) {
    return ["null", undefined, 'false', false].includes(request.input(field))
      ? null
      : request.input(field);
  }
}
