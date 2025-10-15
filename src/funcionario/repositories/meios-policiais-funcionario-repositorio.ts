import Database from '@ioc:Adonis/Lucid/Database';

export default class MeiosPoliciaisFuncionarioRepository {

  public async ver(options: any): Promise<any> {

    try {

      let query = Database.from({ m: 'sigpq_meios' })
        .select(
          'm.id',
          'm.descricao',
          'm.pessoafisica_id',
          'm.quantidade',
          'm.tamanho',
          'm.activo',
          'tm.nome as tipo_meio_nome',
          Database.raw("DATE_FORMAT(m.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(m.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")

        )
        .innerJoin('sigpq_tipo_meios as tm', 'tm.id', 'm.sigpq_tipo_meio_id')
        .where('m.pessoafisica_id', options.id)
        // .where('m.activo', true)
        .where('m.eliminado', false)
        .where(function (item:any): void {

          if (options.search) {
            item.where('m.tamanho', 'like', `%${options.search}%`)
            item.orWhere('m.quantidade', 'like', `%${options.search}%`)
            item.orWhere('tm.nome', 'like', `%${options.search}%`)
          }

        })
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
