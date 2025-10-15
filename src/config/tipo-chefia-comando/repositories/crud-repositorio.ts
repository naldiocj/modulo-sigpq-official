import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import BaseRepository from 'App/@piips/core/repository/BaseRepository'

const validar = require('./../validation/validar')

interface IInput {
  nome: string
  sigla: string
  activo: boolean
  user_id: number
  descricao?: string
}

const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_tipo_chefia_comandos');

export default class CrudRepository {

  public async registar(input: IInput, trx = null): Promise<any> {

    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {

      const result = await tipoFuncaoRepository.registar(valido, trx ? trx : null);

      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo tipo de cargo.');
    }
  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_tipo_chefia_comandos' })
        .select(
          's.id',
          Database.raw('upper(s.nome) as nome'),
          's.sigla',
          's.activo',
          's.descricao',
          's.nivel',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .where('s.eliminado', false)
        // .orderBy('s.ordem')

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

  public async eliminar(id: number) {
  
      const buscarAgente = await Database.from('sigpq_tipo_chefia_comandos')
        .where('eliminado', true)
        .where('id', id)
        .first()
  
      if (buscarAgente) {
        return Error('Agente não existe')
      }
      try {
  
        return true;

      } catch (error) {
        console.log("Erro ao eliminar o agente:", error)
        return Error("Erro ao eliminar o agente:")
      }
    }



}
