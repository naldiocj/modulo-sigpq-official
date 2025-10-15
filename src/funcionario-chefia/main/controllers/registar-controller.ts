import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Repository from '../../repositories/registar-repository'


export default class Controller {
    #repo
    constructor() {
        this.#repo = new Repository()
    }

    public async execute({ auth, request, response }: HttpContextContract): Promise<any> {

        const input = {
            ...request.all(),
            user_id: auth.user?.id,
        }

     
        const result = await this.#repo.execute(input)

        if (result instanceof Error) {
            return response.badRequest({
                message: result.message,
                object: null,
            });
        }

        return response.ok({
            message: 'Sucesso ao registar Evento!',
            object: null,
        });

    }
}
