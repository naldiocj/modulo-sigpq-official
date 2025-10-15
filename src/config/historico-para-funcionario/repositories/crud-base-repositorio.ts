import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseRepository from 'App/@piips/core/repository/BaseRepository'
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';


const validar = require('./../validation/validar')

interface Input {
  pessoafisica_id: number
  sigpq_estado_id?: number
  sigpq_situacao_id?: number
  sigpq_estado_reforma_id?: number
  data_inicio_inatividade: string
  duracao_inatividade?: number
  created_at?: Date
  updated_at?: Date
  user_id: number
}

const tipoCursoRepository = new BaseRepository<Input>('sigpq_historico_funcionario_estados');

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('sigpq_historico_funcionario_estados')
  }
  public async registar(input: Input, trx: any = null): Promise<any> {
    trx = trx ?? await Database.transaction()
    const valido = input
   /*  if (['string'].includes(typeof valido)) {
      return Error(valido);
    } */

    try {

      valido.created_at = new Date()
      valido.updated_at = new Date()
      await Database.insertQuery()
        .table('sigpq_historico_funcionario_estados')
        .insert(valido)
        .useTransaction(trx);


      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      return Error('Não foi possível criar um novo histórico de funcionário');
    }

  }

  public async editar(input: Input, id: number, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()

    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {

      await Database.from('sigpq_historico_funcionario_estados')
        .where("id", id)
        .update(valido)
        .useTransaction(trx);

      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      return Error('Não foi possível criar um novo histórico de funcionário');
    }

  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_historico_funcionario_estados' })
        .select(
          's.id',
          's.nome',
          's.sigla',
          's.activo',
          's.descricao',
          's.user_id',
          'u.pessoa_id',
          Database.raw('upper(u.username) as username'),
          's.tipo',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .where('s.eliminado', false)
        .orderBy('s.nome', 'asc').orderBy('s.created_at', 'desc')
        .leftJoin('users as u', 'u.id', 's.user_id')


        .where(query => {

          if (options.search) {
            query.where('s.nome', 'like', `%${options.search}%`)
            query.orWhere('s.sigla', 'like', `%${options.search}%`)
            query.orWhere('s.tipo', 'like', `%${options.search}%`)
            query.orWhere('u.username', 'like', `%${options.search}%`)
          }
        })
        .where(query => {
          if (options.tipo) {
            query.where('s.tipo', options.tipo)
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

  public async listarUm(id: any): Promise<any> {

    try {
      const result = await tipoCursoRepository.listarUmPorId(id);
      return result

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }
  }

}
