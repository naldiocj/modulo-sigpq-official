import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
export default class ListarRepositorio {

  public async listarTodos(options: any): Promise<any> {
    try {
      let query: DatabaseQueryBuilderContract = Database.from('sigpq_situacao_estados')
        .select(
          'id',
          'nome',
          'sigla',
          'activo',
          'descricao',
          Database.raw("DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .where('eliminado', false)
        .clone()

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
