import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table: string = "sigpq_estados"
  #table_: string = "sigpq_situacao_estados"
  public async run () {
    
    
    const trx = await Database.transaction()
    try {
      const situacao_fa = await Database.from({ s: `${this.#table_}` }).select('s.id', 's.sigla').where('s.sigla', 'FA').first();
     
      const rf = await Database.from(this.#table).select('*').where('sigla', 'EVL').where('sigpq_situacao_id', situacao_fa?.id).first()

      await Database.from(this.#table).where('id', rf?.id).useTransaction(trx).update({
        nome: "Extinção de Vínculo Laboral",
      
      })

      const estados: any[] = []
      const estados_rf = [
       
        {
          nome: "Rescisão",
          sigla: 'RCS',
          user_id: 1,
          sigpq_situacao_id: situacao_fa?.id,
          sigpq_estado_id: rf?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date()

        },
      ]
      estados.push(...estados_rf)

      for (let item of estados) {
        await Database.insertQuery().table(this.#table).useTransaction(trx).insert(item)
      }

      await trx.commit()

    } catch (e) {
      console.log(e)
      await trx.rollback()
    }
  }
}
