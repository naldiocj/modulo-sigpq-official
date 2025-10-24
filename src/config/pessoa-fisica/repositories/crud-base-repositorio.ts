import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('sigpq_tipo_cursos')
  }
 
  public async listarEstados(): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'pessoafisicas' })
        .distinct('estado')
        .select('estado')
        .whereNotNull('estado')
        .orderBy('estado')
        .clone()

      return await query


    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async listarPessoas(): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'pessoas' })
        .select('id', 'nome_completo')
        .where('tipo', 'pf')
        .orderBy('nome_completo', "asc")
        .clone()

      return await query


    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
