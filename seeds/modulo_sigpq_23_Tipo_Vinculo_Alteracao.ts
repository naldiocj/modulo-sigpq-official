import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_vinculos"
  public async run() {

    await Database.from(this.#table).where('nome', 'Agente Efectivo').update({
      sigla: 'AE',
      regime: 'Especial'
    })
    await Database.from(this.#table).where('nome', 'Definitivo').update({
      sigla: 'DFTV',
      regime: 'Especial'
    })
    await Database.from(this.#table).where('nome', 'Por tempo indeterminado').update({
      nome: 'Indeterminado',
      sigla: 'IDT',
      regime: 'Especial'
    })



    const dataNew = [
      {
        nome: 'Definitivo ou Contractual',
        sigla: 'DTC',
        regime: 'Geral',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Estagiário',
        sigla: 'EGR',
        regime: 'Geral',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },

    ]

    for (let item of dataNew) {
      await Database.insertQuery().table(this.#table).insert(item)
    }
  }
}
