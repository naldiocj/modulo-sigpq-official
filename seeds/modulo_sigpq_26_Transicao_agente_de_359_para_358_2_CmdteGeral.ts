import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    const trx = await Database.transaction()
    try {

      let query: any = await Database.from({ sfo: 'sigpq_funcionario_orgaos' })
        .select("*").where('sfo.pessoajuridica_id', 359)

      for (let item of query) {

        await Database.from('sigpq_funcionario_orgaos').useTransaction(trx).where('id', item.id).update({
          eliminado: 1
        })
        await Database.from('pessoajuridicas').useTransaction(trx).where('id', item.pessoajuridica_id).update({
          eliminado: 1
        })
        item.pessoajuridica_id = 358
        const { id, ...rest } = item
        await Database.insertQuery().table('sigpq_funcionario_orgaos').useTransaction(trx).insert(rest)

      }

      await trx.commit()
      console.log('Sucesso na alteracao')

    } catch (e) {
      await trx.rollback()
      console.log('Não foi possível listar os registos. ' + e);
    }
  }
}

