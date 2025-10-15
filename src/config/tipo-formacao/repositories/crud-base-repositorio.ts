import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseRepository from 'App/@piips/core/repository/BaseRepository'
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';


const validar = require('./../validation/validar')

interface Input {
  nome: string
  sigla: string
  activo: boolean
  user_id: number
  descricao?: string
}

const tipoCursoRepository = new BaseRepository<Input>('sigpq_tipo_formacao');

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('sigpq_tipo_formacao')
  }
  public async registar(input: Input, trx: any = null): Promise<any> {
    trx = trx ?? await Database.transaction()
    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {

      const cursoPorNome = await this.findBy('nome', input.nome)
      const cursoPorSigla = await this.findBy('sigla', input.sigla)

      if (cursoPorNome)
        return Error("Esse tipo de formação com este nome já existe")

      if (cursoPorSigla)
        return Error("Esse tipo de formação com esta sigla já existe")

      // await tipoCursoRepository.registar(valido, trx ? trx : null);

      valido.created_at = new Date()
      valido.updated_at = new Date()

      await Database.insertQuery()
        .table('sigpq_tipo_formacao')
        .insert(valido)
        .useTransaction(trx);


      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      return Error('Não foi possível criar um novo Tipo de formação.');
    }

  }

  public async editar(input: Input, id: number, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()

    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {

      const cursoPorNome = await this.findByDiff(id, 'nome', input.nome)
      const cursoPorSigla = await this.findByDiff(id, 'sigla', input.sigla)

      if (cursoPorNome)
        return Error("Esse tipo de formação com este nome já existe")

      if (cursoPorSigla)
        return Error("Esse tipo de formação com esta sigla já existe")


      await Database.from('sigpq_tipo_formacao')
        .where("id", id)
        .update(valido)
        .useTransaction(trx);

      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      return Error('Não foi possível criar um novo Tipo de formação.');
    }

  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_tipo_formacao' })
        .select(
          's.id',
          's.nome',
          's.sigla',
          's.activo',
          's.descricao',
          's.user_id',
          'u.pessoa_id',
          Database.raw('upper(u.username) as username'),
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
            query.orWhere('u.username', 'like', `%${options.search}%`)
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
