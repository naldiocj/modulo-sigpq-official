import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {

  public async run() {

    const estruturaOrganicas = [
      {
        name: "Historico",
        sigla: "HIST",
        ...this.getData,
        user_id: 1
      }
    ]

    for (let item of estruturaOrganicas) {
      await Database.insertQuery().table('tipo_estrutura_organicas').insert(item)
    }

  }


  private get getData() {
    return {
      created_at: new Date(),
      updated_at: new Date()
    }
  }
}
