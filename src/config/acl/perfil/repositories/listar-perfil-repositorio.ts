import Database from '@ioc:Adonis/Lucid/Database';

export default class ListarPerfilRepository {

  public async listarTodos(options: any): Promise<any> {

    // console.log(options);
    
    try {
 
      let query = Database.from('roles as r')
        .select(
          'r.*',
          Database.raw("DATE_FORMAT(r.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(r.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .join('modulos as m', 'm.id', 'r.modulo_id')
        .where('r.name', '<>', 'Root')
        .where('r.eliminado', false)
        .where(function (item: any): void {

          if (options.search) {
            item.where('r.nome', 'like', `%${options.search}%`)
            item.orWhere('r.name', 'like', `%${options.search}%`)
          }

          if (options.modulo_slug) {
            item.where('m.sigla', 'like', options.modulo_slug)
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
