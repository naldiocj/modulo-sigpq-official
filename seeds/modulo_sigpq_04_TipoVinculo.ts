import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_vinculos";
  public async run() {
    // Write your database queries inside the run method
 
    const dataNew = [
      {
        nome: 'Funcionário Efectivo',
        sigla: 'F.E.',
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
    console.log("Tipo de vinculo registado.");

  }
}
