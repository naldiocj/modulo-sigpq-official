import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_funcaos";
  public async run() {
    // Write your database queries inside the run method
    const dataNew = [
      {
        nome: 'DIRECÇÃO NACIONAL',
        sigla: 'FUNCAO-HISTORICO',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'DIRECÇÃO PROVINCIAL',
        sigla: 'FUNCAO-HISTORICO',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'REPARTIÇÃO',
        sigla: 'FUNCAO-HISTORICO',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },{
        nome: 'ESQUADRA',
        sigla: 'FUNCAO-HISTORICO',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },{
        nome: 'COMPANHIA',
        sigla: 'FUNCAO-HISTORICO',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },{
        nome: 'POSTO POLICIAL',
        sigla: 'FUNCAO-HISTORICO',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },{
        nome: 'PELOTÃO',
        sigla: 'FUNCAO-HISTORICO',
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
    console.log("Tipo de cargo registado.");

  }
}
