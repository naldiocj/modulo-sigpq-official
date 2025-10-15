import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import BaseModuloRepository from '../../../../../../app/Repositories/modulo/BaseModuloRepository'

const validar = require('./../validation/validar')

interface IInput {
  nome: string
  sigla: string
  activo: boolean
  user_id: number
  descricao?: string
  dias_maximos:string
  limite_anual:string
}

/* const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_tipos_licencas'); */

export default class CrudRepository {

  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository('sigpq_tipos_licencas')
  }

  public async registar(input: IInput, trx = null): Promise<any> {

    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {

      const findOne=await this.#baseRepo.findByOne([{ field: 'nome', value: input.nome }])
      if(findOne) return Error('Já existe um Tipo de Licença com este nome.') ;
      const result= await this.#baseRepo.registar(valido)
      /* const result = await tipoFuncaoRepository.registar(valido, trx ? trx : null); */
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo Tipo de Licença.');
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
      return Error('Não foi possível criar um novo Tipo de Licença.');
    }
  }

  public async delete(id: any,auth: any, trx = null): Promise<any> {

    try {
       const result= await this.#baseRepo.delete(id,trx,auth.user.id)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível eliminar o Tipo de Licença.');
    }
  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_tipos_licencas' })
        .select(
          's.id',
          Database.raw('upper(s.nome) as nome'),
          's.sigla',
          's.activo',
          's.descricao',
          's.dias_maximos',
          's.limite_anual',
          's.exige_anexo',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .where('s.eliminado', false)
        .orderBy('s.nome')

      if(options.tipo_licenca)
      {
        query.where('s.id', options.tipo_licenca)
      }

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
