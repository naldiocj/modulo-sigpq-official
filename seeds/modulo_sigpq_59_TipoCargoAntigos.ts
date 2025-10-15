import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_cargos";
  public async run() {
    // Write your database queries inside the run method

    // const repo = new TipoContactoRepository()

    const dataNew = [
      {
        nome: 'Comandante de subunidade',
        sigla: 'CS',
        user_id: 1,
        ordem:36,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Chefe de Posto Comando',
        sigla: 'Ch. PC',
        user_id: 1,
        ordem:37,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Chefe de Inspecção',
        sigla: 'Ch. INS',
        user_id: 1,
        ordem:38,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Comandante de Brigada',
        sigla: 'CB',
        user_id: 1,
        ordem:39,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Chefe do Corpo de Inspectores',
        sigla: 'CCI',
        user_id: 1,
        ordem:40,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Chefe do posto',
        sigla: 'CPO',
        user_id: 1,
        ordem:41,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: '2.º Comandante de Unidade',
        sigla: 'CU2.',
        user_id: 1,
        ordem:42,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },{
        nome: 'Chefe de Núcleo',
        sigla: 'CN.',
        user_id: 1,
        ordem:43,
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
