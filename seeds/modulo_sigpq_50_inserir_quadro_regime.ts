import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run () {
    await Database.from('regimes').where('sigla','R.E.').update({
      quadro: 'I',
      updated_at: new Date(),
      user_id: 1,
    })
    await Database.from('regimes').where('sigla','R.G.').update({
      quadro: 'II',
      updated_at: new Date(),
      user_id: 1,
    })
  }
}
