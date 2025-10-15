import Database from "@ioc:Adonis/Lucid/Database";

const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

export default class Repository {

  async execute(id: any, input: any, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()
    let validate = []

    try {

      const camposDesejados: (keyof any)[] = [
        'pessoafisica_id',
        'pessoajuridica_id',
        'user_id',
      ];

      const camposOpcionais: (keyof any)[] = [
        'observacao'
      ];

      validate = mapearCampos(input, camposDesejados, camposOpcionais);

    } catch (error) {

      return Error(error.message)
    }
    try {

      const inputChefia = {
        ...validate,
        updated_at: new Date()
      }

      await Database.from('sigpq_funcionario_chefias').where('id', id)
        .useTransaction(trx).update(inputChefia)

      return await trx.commit()

    } catch (error) {
      console.log(error)
      await trx.rollback()
      return Error('Não foi possível listar item')
    }
  }
}