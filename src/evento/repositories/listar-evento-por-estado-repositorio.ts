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
          'ev.observacao as description',
          'te.nome as tipo_evento_nome',
          'te.id as tipo_evento_id',
          'te.cor as color',
          'u.username as username_operador',
          Database.raw("DATE_FORMAT(ev.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(ev.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")

        )
        .innerJoin('sigpq_tipo_eventos as te', 'te.id', 'ev.sigpq_tipo_evento_id')
        .innerJoin('users as u', 'u.id', 'ev.user_id')
        // .innerJoin('mes as m', 'm.id', 'ev.mes_id')
        .where('ev.eliminado', false)
        .where('ev.pessoafisica_id', options.pessoafisica_id)
        .where('ev.estado', options.estado)
        .where(function (item:any): void {

          if (options.search) {
            item.where('ev.titulo', 'like', `%${options.search}%`)
          }

        })

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
