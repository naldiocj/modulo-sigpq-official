import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import BaseModuloRepository from '../../../../../../app/Repositories/modulo/BaseModuloRepository'
const validar = require('./../validation/validar')

interface IInput {
  user_id: number
  descricao?: string
  activo?:string
  nome:string
  eliminado?:string
  sigla?:string
}

export default class CrudRepository {

  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository('sigpq_empresas')
  }

  public async registar(input: IInput, trx = null): Promise<any> {
    const valido = validar(input)
    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }
    try {
      
           const searchCriteria = [
            { field: "nome", value:valido.nome},
            { field: "eliminado", value: false },
          ];
          const findOne=await this.#baseRepo.findByOne(searchCriteria)
          if(!findOne)return await this.#baseRepo.registar(valido,trx)
          return findOne
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo Feriado.');
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
      return Error('Não foi possível criar um novo Feriado.');
    }
  }

  public async delete(id: any,auth: any, trx = null): Promise<any> {

    try {
       const result= await this.#baseRepo.delete(id,trx,auth.user.id)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível eliminar o dia em Feriado.');
    }
  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_empresas' })
        .select(
          's.*',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAtt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAtt")
        )
        .where('s.eliminado', false)

        .where(query => {

          if (options.search) {
            query.where('s.nome', 'like', `%${options.search}%`)
            query.orWhere('s.sigla', 'like', `%${options.search}%`)
          }
        })

      if (options.activo) {
        query.where('s.activo',options.activo)
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
