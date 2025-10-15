import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import BaseModuloRepository from '../../../../../../app/Repositories/modulo/BaseModuloRepository'

const validar = require('./../validation/validar')

interface IInput {
  nome: string
  sigla: string
  ordem: number
  activo: boolean
  user_id: number
  descricao?: string
}

/* const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_tipo_cargos'); */

export default class CrudRepository {

  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository('sigpq_tipo_cargos')
  }

  public async registar(input: IInput, trx = null): Promise<any> {
    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {
      const findOne=await this.#baseRepo.findByOne([{ field: 'nome', value: input.nome }])
      if(findOne) return ;
      const result= await this.#baseRepo.registar(valido)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo tipo de cargo.');
    }
  }

  public async editar(id: any,input: IInput, trx = null): Promise<any> {


    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {
       const result= await this.#baseRepo.editar(valido,id,trx)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo tipo de cargo.');
    }
  }

  public async delete(id: any,auth: any, trx = null): Promise<any> {

    try {
       const result= await this.#baseRepo.delete(id,trx,auth.user.id)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível eliminar o tipo de cargo.');
    }
  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_tipo_cargos' })
        .select(
          's.id',
          Database.raw('upper(s.nome) as nome'),
          's.sigla',
          's.activo',
          's.descricao',
          's.ordem',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        // .whereNotBetween('s.nome',['Especialista', 'Técnico'])
        .where('s.eliminado', false)
        .orderBy('s.ordem')

      if (options.search) {
        query.where('s.nome', 'like', `%${options.search}%`)
        query.orWhere('s.sigla', 'like', `%${options.search}%`)
      }

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
