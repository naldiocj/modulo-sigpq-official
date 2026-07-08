import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import EliminarRepository from "../../repositories/eliminar-repositorio";
import { useLogger } from "App/Helper/logger";

export default class RegistarController {
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
    const { user }: any = auth.use("jwt").payload;
    const { id } = params;

    const result = await this.#repo.execute(id, null, user?.id);
    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    useLogger(request, auth, "eliminar", "proposta provimentos");

    return response.ok({
      message: "Sucesso ao eliminar remover agente da proposta!",
      object: null,
    });
  }
}
