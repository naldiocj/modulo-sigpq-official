import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseRepository from 'App/@piips/core/repository/BaseRepository'
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';


const validar = require('./../validation/validar')

interface Input {
  nome: string
  sigla: string
  activo: boolean
  user_id: number
  provincia_id: number
  descricao?: string
}

const municipioRepository = new BaseRepository<Input>('municipios');

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('municipios')
  }
  public async registar(input: Input, trx: any = null): Promise<any> {
    trx = trx ?? await Database.transaction()
    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {

      const cursoPorNome = await this.findBy('nome', input.nome)
      // const cursoPorSigla = await this.findBy('sigla', input.sigla)

      if (cursoPorNome)
        return Error("Municipio com este nome já existe")

      // if (cursoPorSigla)
      //   return Error("Município com esta sigla já existe")

      valido.sigla = input.sigla


      // await municipioRepository.registar(valido, trx ? trx : null);

      valido.created_at = new Date()
      valido.updated_at = new Date()

      await Database.insertQuery()
        .table('municipios')
        .insert(valido)
        .useTransaction(trx);


      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      return Error('Não foi possível criar um novo curso.');
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
      // const cursoPorSigla = await this.findByDiff(id, 'sigla', input.sigla)

      if (cursoPorNome)
        return Error("Município com este nome já existe")

      // if (cursoPorSigla)
      //   return Error("Município com esta sigla já existe")


      valido.sigla = input.sigla


      await Database.from('municipios')
        .where("id", id)
        .update(valido)
        .useTransaction(trx);

      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      return Error('Não foi possível criar um novo curso.');
    }

  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'municipios' })
        .select(
          's.id',
          Database.raw('upper(s.nome) as nome'),
          Database.raw('upper(s.sigla) as sigla'),
          's.activo',
          's.descricao',
          Database.raw('upper(p.nome) as provincia'),
          'p.id as provincia_id',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .where('s.eliminado', false)
        .orderBy('s.nome', 'asc').orderBy('s.created_at', 'desc')
        .innerJoin('provincias as p', 'p.id', 's.provincia_id')
        .where(query => {
          if (options.search) {
            query.where('s.nome', 'like', `%${options.search}%`)
            query.orWhere('s.sigla', 'like', `%${options.search}%`)
            query.orWhere('p.nome', 'like', `%${options.search}%`)
          }
        })
        .where(query => {
          if (options.provincia_id) {
            query.where('s.provincia_id', options.provincia_id)
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
      const result = await municipioRepository.listarUmPorId(id);
      return result

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }
  }

}
