import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_meios";
 
  public async run() {
    // Write your database queries inside the run method

    // const repo = new TipoContactoRepository()

    const dataNew = [
      {
        nome: 'Calça',
        sigla: 'CL',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Camisa',
        sigla: 'CS',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Bota',
        sigla: 'BT',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Algema',
        sigla: 'AL',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Camisola Interior',
        sigla: 'CS',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
    ];

    // await repo.createMany(dataNew)
    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table(this.#table)
        .insert(iterator)
    }
    console.log("Tipo de contacto registado.");

  }
}
