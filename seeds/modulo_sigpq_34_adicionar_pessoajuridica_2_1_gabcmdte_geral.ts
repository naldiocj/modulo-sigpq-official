import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "pessoas";
  public async run() {


    const dataNew = [
      {
        nome_completo: 'GABINETE DO 2.º  COMANDANTE GERAL II',
        sigla: 'GAB. 2.º CMDTE GERAL II',
        orgao_comando_provincial: 'Orgão',
        user_id: 1,
        tipo_estrutura_organica_sigla: 'SAI',
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },

    ];

    for (const iterator of dataNew) {
      const pessoa = {
        nome_completo: iterator.nome_completo,
        tipo: 'pj',
        user_id: iterator.user_id,
        created_at: new Date(),
        updated_at: new Date()
      }

      const pessoaId = await Database
        .insertQuery()
        .table(this.#table)
        .insert(pessoa)

      const pj = {
        id: pessoaId,
        sigla: iterator.sigla,
        pessoajuridica_id: null,
        tipo_pessoajuridica_id: 1,
        activo: 1,
        tipo_estrutura_organica_sigla: 'SAI',
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

    await Database.from('pessoajuridicas').where('id', 358).update({
      sigla: ' GAB. 2.º CMDTE GERAL I'
    }).first()

    await Database.from('pessoas').where('id', 358).update({
      nome_completo: 'GABINETE DO 2.º  COMANDANTE GERAL I'
    }).first()

    console.log("Orgão ou comando registado.");

  }

}
