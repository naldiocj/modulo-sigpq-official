import Database from "@ioc:Adonis/Lucid/Database"

export default class Repository {

    public async execute(id: any, user_id: any, trx: any = null): Promise<any> {
        trx = trx ?? await Database.transaction()
        try {

            const query = await Database.from('users').where('id', id).where('eliminado', false).first()

            if (!query) return Error('Utilizador não encontrado')

            await Database.from('users').where('id', id).where('eliminado', false).update({
                activo: !query.activo,
                user_id
            }).useTransaction(trx)

            return await trx.commit()

        } catch (error) {
            console.log(error)
            await trx.rollback()
            return Error('Não foi possível desactivar o utilizador')
        }
    }
}