import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';

export default class ListarTipoVinculoRepository {
  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository('sigpq_tipo_vinculos')
  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_tipo_vinculos' })
        .select(
          's.id',
          's.nome',
          's.sigla',
          's.activo',
          's.descricao',
          's.regime',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .where('s.eliminado', false)
        .where(query => {
          if (options.regime) {
            query.where('s.regime', options.regime)
          }
        }).where(query => {
          if (options.sigpq_vinculo_id) {
            query.where('s.sigpq_vinculo_id', options.sigpq_vinculo_id)
          }
        })

      if (options.search) {
        query.where('s.nome', 'like', `%${options.search}%`)
        query.orWhere('s.sigla', 'like', `%${options.search}%`)
        query.orWhere('s.regime', 'like', `%${options.search}%`)
      }

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
