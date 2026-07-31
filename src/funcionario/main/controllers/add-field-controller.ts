import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import AddFieldRepository from "../../repositories/add-field-repositorio";

const removeTextNullVariable = require("App/@piips/shared/metodo-generico/RemoveTextNullVariable");

const { ok } = require("App/Helper/Http-helper");

export default class AddFieldController {
  #addField: AddFieldRepository;

  constructor() {
    this.#addField = new AddFieldRepository();
  }

  public async registar({
    auth,
    request,
    response,
  }: HttpContextContract): Promise<any> {
    const input = removeTextNullVariable({
      ...request.all(),
      user_id: auth.user?.id,
    });

    if (!input.user_id) {
      return response.badRequest({
        message: "Utilizador não está logado",
        object: null,
      });
    }

    const result = await this.#addField.registar(input);

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(result, "Sucesso ao adicionar!");
  }
}
