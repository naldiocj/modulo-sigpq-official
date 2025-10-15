import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseRepository from 'App/@piips/core/repository/BaseRepository'
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';

const validar = require('./../validation/validar')

interface Input {
  nome: string
  sigla: string
  activo: boolean
  user_id: number
  municipio_id: number
  descricao?: string
}

const distritoRepository = new BaseRepository<Input>('distritos');

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('distritos')
  }
  public async registar(input: Input, trx: any = null): Promise<any> {
    trx = trx ?? await Database.transaction()
    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {

      const municipioNOme = await this.findBy('nome', input.nome)
      // const municipioSigla = await this.findBy('sigla', input.sigla)

      if (municipioNOme)
        return Error("Distrito com este nome já existe")

      // if (municipioSigla)
      //   return Error("Distrito com esta sigla já existe")

      valido.sigla = input.sigla




      // await distritoRepository.registar(valido, trx ? trx : null);

      valido.created_at = new Date()
      valido.updated_at = new Date()

      await Database.insertQuery()
        .table('distritos')
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

      const municipioNOme = await this.findByDiff(id, 'nome', input.nome)
      // const municipioSigla = await this.findByDiff(id, 'sigla', input.sigla)

      if (municipioNOme)
        return Error("Distrito com este nome já existe")

      // if (municipioSigla)
      //   return Error("Distrito com esta sigla já existe")


      valido.sigla = input.sigla

      await Database.from('distritos')
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

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'distritos' })
        .select(
          's.id',
          Database.raw('upper(s.nome) as nome'),
          Database.raw('upper(s.sigla) as sigla'),
          's.activo',
          's.descricao',
          Database.raw('upper(m.nome) as municipio'),
          'm.id as municipio_id',
          Database.raw('upper(p.nome) as provincia'),
          'p.id as provincia_id',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .where('s.eliminado', false)
        .orderBy('s.nome', 'asc').orderBy('s.created_at', 'desc')
        .innerJoin('municipios as m', 'm.id', 's.municipio_id')
        .innerJoin('provincias as p ', 'p.id', 'm.provincia_id')
        .orderBy('s.nome', 'desc').orderBy('p.nome', 'desc').orderBy('m.nome', 'desc')
        .where(query => {


          if (options.search) {
            query.where('s.nome', 'like', `%${options.search}%`)
            query.orWhere('s.sigla', 'like', `%${options.search}%`)
            query.orWhere('m.nome', 'like', `%${options.search}%`)
            query.orWhere('p.nome', 'like', `%${options.search}%`)
            query.orWhere('p.sigla', 'like', `%${options.search}%`)
            query.orWhere('m.sigla', 'like', `%${options.search}%`)
          }
        })
        .where(query => {
          if (options.provincia_id) {
            query.where('m.provincia_id', options.provincia_id)
          }
        })
        .where(query => {
          if (options.municipio_id) {
            query.where('s.municipio_id', options.municipio_id)
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
      const result = await distritoRepository.listarUmPorId(id);
      return result

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }
  }

}
