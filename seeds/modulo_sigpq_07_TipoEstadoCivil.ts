import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "estado_civils";
  public async run() {
    // Write your database queries inside the run method

    const dataNew = [
      {
        nome: 'Solteiro (a)',
        sigla: 'Sol',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Casado (a)',
        sigla: 'Cas',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Viúvo (a)',
        sigla: 'Viú',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Divorciado (a)',
        sigla: 'Div',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // await repo.createMany(dataNew)
    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table(this.#table)
        .insert(iterator)
    }
    console.log("Tipo de estado civíl registado.");

  }
}
