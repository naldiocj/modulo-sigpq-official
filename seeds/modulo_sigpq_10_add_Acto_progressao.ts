import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_acto_progressaos";

  public async run() {
    // Write your database queries inside the run method

    const dataNew = [
      {
        nome: 'Patenteamente',
        sigla: 'PTM',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Despromoção',
        sigla: 'DM',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Desgraduação',
        sigla: 'DG',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    
    for (const iterator of dataNew) {
      await Database
        .insertQuery() 
        .table(this.#table)
        .insert(iterator)
    }
    console.log("Promoção registado.");

  }
}
