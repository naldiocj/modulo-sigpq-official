import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import BaseModuloRepository from '../../../../../../app/Repositories/modulo/BaseModuloRepository'

const validar = require('./../validation/validar')
const validarStadoActivo=require('./../validation/validarStadoActivo')

interface IInput {
  nome: string
  sigla: string
  activo: boolean
  user_id: number
  descricao?: string
  dias_maximos:string
  limite_anual:string
}

interface IIalterarInput{
  activo:boolean
}

/* const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_tipos_licencas'); */

export default class CrudRepository {

  #table='sigpq_plano_licencas';
  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository(this.#table)
  }

  public async registar(input: IInput, trx = null): Promise<any> {

    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {

      /* const findOne=await this.#baseRepo.findByOne([{ field: 'nome', value: input.nome }])
      if(findOne) return Error('Já existe um Tipo de Plano de Licença com este nome.') ; */
      const result= await this.#baseRepo.registar(valido)
      /* const result = await tipoFuncaoRepository.registar(valido, trx ? trx : null); */
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo Tipo de Plano de Licença.');
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
      return Error('Não foi possível criar um novo Tipo de Plano de Licença.');
    }
  }

  public async alterarStadoActivo(id: any,input: IIalterarInput, trx = null): Promise<any> {
    const valido = validarStadoActivo(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }
    try {
       const result= await this.#baseRepo.editar(valido,id,trx)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo Tipo de Plano de Licença.');
    }
  }

  public async delete(id: any,auth: any, trx = null): Promise<any> {

    try {
       const result= await this.#baseRepo.delete(id,trx,auth.user.id)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível eliminar o Tipo de Plano de Licença.');
    }
  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: this.#table })
        .select(
          's.id',
          Database.raw('upper(s.nome) as nome'),
          's.activo',
          's.descricao',
          's.dia_inicio',
          's.dia_fim',
          's.tipo_licenca_id',
          Database.raw('upper(sigpq_tipos_licencas.nome) as licenca_nome'),
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .innerJoin('sigpq_tipos_licencas','sigpq_tipos_licencas.id','s.tipo_licenca_id')
        .where('s.eliminado', false)
        .orderBy('s.nome')

      if (options.search) {
        query.where('s.nome', 'like', `%${options.search}%`)
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
