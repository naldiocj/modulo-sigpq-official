import Database from "@ioc:Adonis/Lucid/Database";
const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

export default class Repository {

  async execute(input: any, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()
    let validate = []
    try {

      const camposDesejados: (keyof any)[] = [
        'sigpq_tipo_chefia_comando_id',
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

      await Database.from('sigpq_funcionario_chefias').where('pessoafisica_id', input.pessoafisica_id).where('eliminado', false).update({
        user_id: input.user_id,
        activo: false
      }).useTransaction(trx)

      const inputChefia = {
        ...validate,
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
      
      await Database.insertQuery().insert(inputChefia).table('sigpq_funcionario_chefias').useTransaction(trx)
      return await trx.commit()

    } catch (error) {
      console.log(error)
      await trx.rollback()
      return Error('Não foi possível listar item')
    }
  }
}