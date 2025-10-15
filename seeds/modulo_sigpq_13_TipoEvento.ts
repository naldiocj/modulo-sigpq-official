import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_eventos";

  public async run() {
    // Write your database queries inside the run method

    // const repo = new TipoContactoRepository()

    const dataNew = [
      {
        nome: 'Férias',
        sigla: 'F',
        cor: "#005CB8",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Ausências',
        sigla: 'A',
        cor: "#e06426",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Guia Médica',
        sigla: 'BM',
        cor: "#bd6464",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia de Aniversário',
        sigla: 'DA',
        cor: "#8e22d6",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Licença de Casamento',
        sigla: 'LC',
        cor: "#f02424",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Licença de Maternidade',
        sigla: 'LM',
        cor: "#be40c7",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Licença de Paternidade',
        sigla: 'LP',
        cor: "#40a4bd",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      // {
      //   nome: 'Planeamento Semanal',
      //   sigla: 'LM',
        // cor: "#93e6af",
      //   user_id: 1,
      //   descricao: 'Criado automaticamente pelo sistema.',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      {
        nome: 'Reuniões',
        sigla: 'R',
        cor: "#8d92e3",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Teletrabalho',
        sigla: 'TL',
        cor: "#13b048",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Trabalho no Estrangeiro',
        sigla: 'TE',
        cor: "#e3dd35",
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Actividades',
        sigla: 'AT',
        cor: "#9d2933",
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
    console.log("Tipo de evento registado.");

  }
}
