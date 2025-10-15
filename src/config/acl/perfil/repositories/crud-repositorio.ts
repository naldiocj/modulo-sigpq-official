import Database from '@ioc:Adonis/Lucid/Database'
import BaseRepository from 'App/@piips/core/repository/BaseRepository'
const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

interface Perfil {
  name: string
  nome: string
  descricao: string
  modulo_id: number
  user_id: number

}

const perfilRepository = new BaseRepository<Perfil>('roles');

export default class CrudRepository {

  public async registar(input: Perfil, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()
    try {

      if (!input.nome) {
        return Error(' O campo nome é obrigatório')
      }

      if (!input.name) {
        return Error('O campo sigla é obirgatório')
      }
      if (!input.modulo_id) {
        return Error('Escolha um sistema ou modulo')
      }


      const nome = await this.findByModulo(input?.modulo_id, 'nome', input?.nome)
      const sigla = await this.findByModulo(input?.modulo_id, 'name', input?.name)

      if (nome) {
        return Error('Esta funcão para este sistema já existe')
      }
      if (sigla) {
        return Error('Esta sigla para função deste  sistema já existe')

      }

      const perfilInput: any = {
        modulo_id: input?.modulo_id,
        name: input?.name,
        nome: input.nome,
        user_id: input?.user_id,
        descricao: input?.descricao,
        ...this.dateTime
      }
      await Database.insertQuery().table('roles').useTransaction(trx).insert(perfilInput)
      return await trx.commit()

    } catch (error) {
      await trx.rollback()
      console.log(error)
    }


  }
  public async editar(id: any, input: Perfil, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()
    try {

      if (!input.nome) {
        return Error(' O campo nome é obrigatório')
      }

      if (!input.name) {
        return Error('O campo sigla é obirgatório')
      }
      if (!input.modulo_id) {
        return Error('Escolha um sistema ou modulo')
      }


      const nome = await this.findByModulo(input?.modulo_id, 'nome', input?.nome, id)
      const sigla = await this.findByModulo(input?.modulo_id, 'name', input?.name, id)

      if (nome) {
        return Error('Esta funcão para este sistema já existe')
      }
      if (sigla) {
        return Error('Esta sigla para função deste  sistema já existe')

      }

      const perfilInput: any = {
        modulo_id: input?.modulo_id,
        name: input?.name,
        nome: input.nome,
        user_id: input?.user_id,
        descricao: input?.descricao,
        updated_at: this.dateTime.updated_at
      }

      await Database.from('roles').useTransaction(trx).update(perfilInput).where('id', id)
      return await trx.commit()

    } catch (error) {
      await trx.rollback()
      console.log(error)
    }


  }

  public async listarTodos(filtro: any): Promise<any> {
    return await perfilRepository.listarTodos(filtro)
  }


  public async findByModulo(modulo_id: any, field: any, value: any, id: any = null): Promise<any> {
    if (id) {
      return modulo_id ? await Database.from('roles').where('modulo_id', modulo_id).where(field, value).where('id', '<>', id).first() : null

    } else {
      return modulo_id ? await Database.from('roles').where('modulo_id', modulo_id).where(field, value).first() : null
    }

  }


  get dateTime() {
    return {
      created_at: new Date(),
      updated_at: new Date()
    }
  }



}
