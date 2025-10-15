import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    const trx = await Database.transaction()
    try {

      const oficiasComissarios = await Database.from('sigpq_tipo_carreiras').where('nome', 'Oficial Comissário').first()

      const oficiasSuperiores = await Database.from('sigpq_tipo_carreiras').where('nome', 'Oficial Superior').first()

      const oficiasSubalternos = await Database.from('sigpq_tipo_carreiras').where('nome', 'Oficial Subalterno').first()


      const subChefes = await Database.from('sigpq_tipo_carreiras').where('nome', 'Subchefes').first()

      const agentes = await Database.from('sigpq_tipo_carreiras').where('nome', 'Agentes').first()

      const patenteComissarios = await Database.from('patentes').where('classe', 'Oficial Comissário')

      const patenteSuperiores = await Database.from('patentes').where('classe', 'Oficial Superior')

      const patenteSubalternos = await Database.from('patentes').where('classe', 'Oficial Subalterno')

      const patenteSubchefes = await Database.from('patentes').where('classe', 'Subchefe')

      const patenteAgentes = await Database.from('patentes').where('classe', 'Agente')

  
      

      for (let item of patenteComissarios) {
        await Database.from('patentes').useTransaction(trx).where('id', item?.id).update({
          sigpq_tipo_carreira_id: oficiasComissarios?.id
        })
      }

      for (let item of patenteSuperiores) {
        await Database.from('patentes').useTransaction(trx).where('id', item?.id).update({
          sigpq_tipo_carreira_id: oficiasSuperiores?.id
        })
      }

      for (let item of patenteSuperiores) {
        await Database.from('patentes').useTransaction(trx).where('id', item?.id).update({
          sigpq_tipo_carreira_id: oficiasSuperiores?.id
        })
      }

      for (let item of patenteSubalternos) {
        await Database.from('patentes').useTransaction(trx).where('id', item?.id).update({
          sigpq_tipo_carreira_id: oficiasSubalternos?.id
        })
      }
      for (let item of patenteSubchefes) {
        await Database.from('patentes').useTransaction(trx).where('id', item?.id).update({
          sigpq_tipo_carreira_id: subChefes?.id
        })
      }
      for (let item of patenteAgentes) {
        await Database.from('patentes').useTransaction(trx).where('id', item?.id).update({
          sigpq_tipo_carreira_id: agentes?.id
        })
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      console.log(error)
    }
  }
}
