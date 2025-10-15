import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';

export default class CreateUtilizadorRepository {

  public async listarTodos(): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ f: 'sigpq_funcionarios' })
        .select(
          'f.id',
          'f.nip',
          'f.numero_agente',
          'pessoas.nome_completo'
        )
        .innerJoin('pessoas as p', 'p.id', 'f.id')
        .innerJoin('users as u', 'u.pessoa_id', 'f.id')
        .clone()

      return await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
