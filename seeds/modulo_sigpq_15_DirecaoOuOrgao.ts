import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "pessoas";

  public async run() {
    // Write your database queries inside the run method

    const dataNew = [
      {
        nome_completo: 'Direção de Telecomunicações e Tecnologias de Informação',
        sigla: 'DTTI',
        orgao_comando_provincial: 'Orgão',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },

    ];

    // await repo.createMany(dataNew)
    for (const iterator of dataNew) {
      const pessoa = {
        nome_completo: iterator.nome_completo,
        tipo: 'pj',
        user_id: iterator.user_id,
        created_at: new Date(),
        updated_at: new Date()
      }

      const pessoaId = await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table(this.#table)
        .insert(pessoa)

      const pj = {
        id: pessoaId,
        sigla: iterator.sigla,
        pessoajuridica_id: null,
        tipo_pessoajuridica_id: 1,
        activo: 1,
        descricao: iterator.descricao,
        orgao_comando_provincial: iterator.orgao_comando_provincial,
        created_at: new Date(),
        updated_at: new Date()
      }

      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table('pessoajuridicas')
        .insert(pj)
    }

    console.log("Orgão ou comando registado.");

  }
}
