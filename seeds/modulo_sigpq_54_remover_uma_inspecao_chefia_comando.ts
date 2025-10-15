import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    await Database.from('sigpq_tipo_chefia_comandos').where('id', 3).delete()
  }
}
