// import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';
import Database from '@ioc:Adonis/Lucid/Database';

export default class Repository {
  // #baseRepo
  constructor() {
    // this.#baseRepo = new BaseModuloRepository('sigpq_eventos')
  }

  public async listarTodos(options: any): Promise<any> {

    try {
      let query = Database.from({ ev: 'sigpq_eventos' })
        .select(
          // 'ev.ano',
          // 'm.id as mes_id',
          // 'm.nome as mes',
          // 'm.sigla as mes_sigla',
          'ev.estado',
          'ev.observacao',
          'te.nome as tipo_evento_nome',
          'te.id as tipo_evento_id',
          'te.cor as tipo_evento_cor',
          'u.username as username_operador',
          Database.raw("DATE_FORMAT(ev.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(ev.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")

        )
        .innerJoin('sigpq_tipo_eventos as te', 'te.id', 'ev.sigpq_tipo_evento_id')
        .innerJoin('users as u', 'u.id', 'ev.user_id')
        // .innerJoin('mes as m', 'm.id', 'ev.mes_id')
        .where('ev.eliminado', false)
        .where('ev.pessoafisica_id', options.pessoafisica_id)
        .where(function (item:any): void {

          if (options.search) {
            item.where('ev.titulo', 'like', `%${options.search}%`)
          }

        })
        .then(function (result:any) {

          const rows: any = []

          for (const iterator of result) {
            rows.push({
              id: iterator.id,
              title: iterator.titulo,
              date: iterator.data,
              description: iterator.observacao,
              color: iterator.tipo_evento_cor,
              estado: iterator.estado,
              tipo_evento_id: iterator.tipo_evento_id,
              tipo_evento_nome: iterator.tipo_evento_nome,
              createdAt: iterator.created_at,
              updatedAt: iterator.updated_at,
            })
          }

          return rows
        })
        .catch(() => { return []; });

      return await query

      // return options.page
      //   ? await query.paginate(options.page, options.perPage || 10)
      //   : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
