import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Repository from "../../repositories/acitva-desactiva-repository";
const { ok } = require('App/Helper/Http-helper');

export default class Controller {
    #repo: Repository
    constructor() {
        this.#repo = new Repository()
    }

    async execute({ params, response, auth }: HttpContextContract) {
        const { id } = params
        const user_id = auth?.user?.id

        const result = await this.#repo.execute(id, user_id)

        if (result instanceof Error) {
            response.badRequest({
                message: result.message,
                object: null
            })
        }

        return ok(null, 'Sucesso na troca de estado do Utilizador')
    }
}