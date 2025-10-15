import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    const actos: any = [
      {
        sigla: 'PTM',
        ordem: 1,
      },
      {
        sigla: 'PM',
        ordem: 2,
      },
      {
        sigla: 'GC',
        ordem: 3,
      },
      {
        sigla: 'DM',
        ordem: 4,
      },
      {
        sigla: 'DG',
        ordem: 5,
      },
    ]

    for (let item of actos) {
      await Database.from('sigpq_acto_progressaos').where({
        sigla: item?.sigla
      }).update({
        ordem: item?.ordem
      }).first()
    }
  }
}
