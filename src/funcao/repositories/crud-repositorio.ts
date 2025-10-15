import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'

// const { uploadFile, deleteDirectory } = require('App/@piips/shared/metodo-generico/Upload-Or-Read-File')
// const { extensao_ordem, extensao_despacho } = require('App/@piips/shared/metodo-generico/Buscar-Data-Extensao')

import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository'
// import BaseRepository from 'App/@piips/core/repository/BaseRepository'
// import BaseRepository from 'App/@piips/core/repository/BaseRepository'

const validar = require('../validation/validar')

interface IInput {
  pessoafisica_id: number
  pessoajurifica_id: number
  situacao: string
  // sigpq_acto_nomeacao_id: number
  sigpq_tipo_funcao_id: number
  // numero_ordem_nomeacao: string
  // numero_despacho_nomeacao: string
  // data_ordem_nomeacao: string
  // data_despacho_nomeacao: string
  patente_id: number
  user_id: number
}

const dateTime = new Date()

// const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_funcaos');

export default class CrudRepository extends BaseModuloRepository {

  constructor() {
    super('sigpq_funcaos')
  }
  public async registar(input: IInput, file: any, trx: any = null): Promise<any> {
    trx = trx ?? await Database.transaction()
    const valido = await validar(input)
    // input.situacao == situacao.ACTUAL ? validarFuncaoActual(input) : validarFuncaoExercida(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }


    try {

      // const file_ = file.file('anexo_nomeacao')
      // const anexo = file_ ? await uploadFile(input.pessoafisica_id + '/anexo-guia', file_) : null;


      const inputFuncao: any = {
        ...valido,
        // numero_despacho: extensao_despacho(input?.data_despacho_nomeacao, input?.numero_despacho_nomeacao),
        // numero_ordem:  input?.numero_despacho_nomeacao,
        // situacao: this.getSituacao(input.situacao),
        activo: input.situacao == 'exercída' ? 0 : 1,
        // data: input?.data_despacho_nomeacao,
        // anexo,
        created_at: dateTime,
        updated_at: dateTime
      }

      delete inputFuncao['data_despacho_nomeacao']
      delete inputFuncao['data_ordem_nomeacao']
      delete inputFuncao['numero_despacho_nomeacao']
      delete inputFuncao['numero_ordem_nomeacao']

      // console.log(inputFuncao)




      await Database.insertQuery().useTransaction(trx).table('sigpq_funcaos').insert(inputFuncao)

      // const file_ = file.file('anexo')
      // const anexo = file_ ? await uploadFile(input.pessoafisica_id + '/anexo-guia', file_) : null;

      // const inputFuncao: any = {
      //   ...valido,
      //   activo: input.situacao == 'exercída' ? 0 : 1,
      //   anexo,
      //   created_at: dateTime,
      //   updated_at: dateTime
      // }

      // // const result = await tipoFuncaoRepository.registar(valido, trx);

      // await Database.insertQuery().useTransaction(trx).table('sigpq_funcaos').insert(inputFuncao)

      return trx.commit()
    } catch (e) {
      console.log(e);
      // await deleteDirectory(input.pessoafisica_id + '/anexo-guia')
      return Error('Não foi possível criar registo.');
    }
  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ f: 'sigpq_funcaos' })
        .select(
          'f.id',
          'f.situacao',
          'f.pessoafisica_id',
          'f.pessoajuridica_id',
          'pj.sigla as sigla_orgao',
          Database.raw('upper(p.nome_completo) as direcao'),
          'tf.id as sigpq_tipo_funcao_id',
          'tf.nome',
          'pj.orgao_comando_provincial',
          'f.activo',
          'pt.id as patente_id',
          'pt.nome as patente',
          'pt.classe as patente_classe',

          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt"),
        )
        .innerJoin('sigpq_tipo_funcaos as tf', 'tf.id', 'f.sigpq_tipo_funcao_id')
        .leftJoin('pessoajuridicas as pj', 'pj.id', 'f.pessoajuridica_id')
        .leftJoin('patentes as pt', 'pt.id', 'f.patente_id')


        .leftJoin('pessoas as p', 'p.id', 'pj.id')
        .where('f.eliminado', false)
        .orderBy('f.activo', 'desc')

        .where(query => {
          if (options.pessoafisica_id) {
            query.where('f.pessoafisica_id', options.pessoafisica_id)
          }
        })
        .where(query => {
          if (options.pessojuridica_id) {

            query.where('f.pessoajuridica_id', options.pessoajuridica_id)
          }
        })
        .where(query => {
          if (options.search) {
            query.where('tf.nome', 'like', `%${options.search}%`)
            query.orWhere('pt.nome', 'like', `%${options.search}%`)
            query.orWhere('pj.sigla', 'like', `%${options.search}%`)
            query.orWhere('pj.orgao_comando_provincial', 'like', `%${options.search}%`)
            query.orWhere('p.nome_completo', 'like', `%${options.search}%`)
            query.orWhere('f.situacao', 'like', `%${options.search}%`)
            query.orWhere('f.numero_ordem', 'like', `%${options.search}%`)
            query.orWhere('f.numero_despacho', 'like', `%${options.search}%`)

          }
        }).clone()

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

      let query: any = Database.from({ f: 'sigpq_funcaos' })
        .select(
          'f.id',
          'f.data_inicio',
          'f.data_fim',
          'f.situacao',
          'f.pessoafisica_id',
          'f.pessoajuridica_id',
          'pj.sigla as sigla_orgao',
          'p.nome_completo as orgao',
          'tf.id as sigpq_tipo_funcao_id',
          'tf.nome',
          'f.activo',
          'f.observacao',
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .innerJoin('sigpq_tipo_funcaos as tf', 'tf.id', 'f.sigpq_tipo_funcao_id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'f.pessoajuridica_id')
        .innerJoin('pessoas as p', 'p.id', 'pj.id')

        .where('f.eliminado', false)
        .orderBy('tf.created_at')
        .where('f.id', id).first()

      return await query



    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }
  }



}
