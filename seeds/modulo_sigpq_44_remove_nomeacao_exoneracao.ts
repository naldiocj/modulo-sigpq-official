import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_acto_progressaos";
  public async run() {
    await Database.from(this.#table).whereIn('sigla', ['NC', 'EX']).update({
      user_id: 1,
      eliminado: true,
      updated_at: new Date()
    })
  }
}
