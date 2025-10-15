import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {

    const dataNew = [
      {
        nome: "Inactivo",
        sigla: 'IN',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()

      }
    ]

    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table("sigpq_situacao_estados")
        .insert(iterator)
    }
    console.log("Tipo de sigpq_situacao_estados registado.");
  }
}
