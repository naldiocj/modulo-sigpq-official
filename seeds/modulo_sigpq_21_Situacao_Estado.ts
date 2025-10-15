import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table: string = "sigpq_situacao_estados"
  public async run() {

    const dataNew = [
      {
        nome: "Efectividade",
        sigla: 'EFT',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()

      },
      {
        nome: "Comissão de Normal de Serviço",
        sigla: 'CNS',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()

      },
      {
        nome: "Comissão Especial de Serviço",
        sigla: 'CES',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()

      },
      {
        nome: "Inactividade Temporária",
        sigla: 'IT',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()

      },
      {
        nome: "Fora de Actividade",
        sigla: 'FA',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()

      },
    ]

    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table(this.#table)
        .insert(iterator)
    }
    console.log("Tipo de situação me relação ao estado registado.");
  }
}
