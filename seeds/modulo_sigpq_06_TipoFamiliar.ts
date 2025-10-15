import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_familiars";
  public async run() {
    // Write your database queries inside the run method
 
    const dataNew = [
      {
        nome: 'Pai',
        sigla: 'P',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Mãe',
        sigla: 'M',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Esposo (a)',
        sigla: 'Esp',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }, 
      {
        nome: 'Filho (a)',
        sigla: 'F',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }, 
      {
        nome: 'Sobrinho (a)',
        sigla: 'S',
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
    console.log("Tipo de regime registado.");

  }
}
