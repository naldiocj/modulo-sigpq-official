import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import BaseModuloRepository from '../../../../../../app/Repositories/modulo/BaseModuloRepository'
import {DateTime} from 'luxon'
const validar = require('./../validation/validar')

interface IInput {
  user_id: number
  descricao?: string
  activo?:string
  nome:string
  eliminado?:string
  dia_selecionado:string
  licenca_aplicada?:boolean
  observacoes?:string
}

export default class CrudRepository {

  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository('modulo_sigpq_feriados')
  }

  public async registar(input: IInput, trx = null): Promise<any> {
    const valido = validar(input)
    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }
    try {
      const diaSelecionadoDateTime = DateTime.fromISO(input.dia_selecionado);

           const searchCriteria = [
            { field: "dia_selecionado", value:diaSelecionadoDateTime.toISODate()},
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

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'modulo_sigpq_feriados' })
        .select(
          's.*',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAtt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAtt")
        )
        .where('s.eliminado', false)

      if (options.pessoafisica_id) {
        query.where('s.pessoafisica_id',options.pessoafisica_id)
      }

      if (options.dia_selecionado) {
        query.where('s.dia_selecionado',options.dia_selecionado)
      }
      if (options.search) {
        query.where('s.nome', 'like', `%${options.search}%`)
      }
      if (options.licenca_aplicada) {
        query.where('s.licenca_aplicada',options.licenca_aplicada)
      }

      if (options.tipo_licenca_id) {
        query.where('s.tipo_licenca_id',options.tipo_licenca_id)
      }

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
