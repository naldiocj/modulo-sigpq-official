import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';

export default class ListarRepositorio {

  public async listarTodos(options: any): Promise<any> {
    
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ r: 'roles' })
        .select(
          'r.id',
          'r.name',
          'r.nome'
        )
        .where('r.name', '<>', 'Root')
        .where('r.modulo_id', options.modulo_id)
        .where('r.eliminado', false)
        .where(function (item: any): void {

          if (options.search) {
            item.where('r.nome', 'like', `%${options.search}%`)
            item.orWhere('r.name', 'like', `%${options.search}%`)
          }

          if (options.modulo_id) {
            item.where('r.modulo_id', options.modulo_id)
          }

        }).clone()

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
