import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import MapaCargoDirecaoChefiaRepository from "../../repositories/mapa-cargo-direcao-chefia-repositorio";

const { ok } = require("App/Helper/Http-helper");

export default class Controller {
  #mapaCargoDirecaoChefiaRepository;
  data = new Date();

  constructor() {
    this.#mapaCargoDirecaoChefiaRepository =
      new MapaCargoDirecaoChefiaRepository();
  }

  public async listarTodos({
    auth,
    response,
  }: HttpContextContract): Promise<any> {
    const { user }: any = auth.use("jwt").payload;

    if (!user) {
      return response.badRequest({
        message: "Utilizador não está logado",
        object: null,
      });
    }

    const result = await this.#mapaCargoDirecaoChefiaRepository.listarTodos({});
    return ok(result, null);
  }
}
