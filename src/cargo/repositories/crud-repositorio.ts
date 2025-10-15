import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'

const { uploadFile, deleteDirectory } = require('App/@piips/shared/metodo-generico/Upload-Or-Read-File')
const { extensao_ordem, extensao_despacho } = require('App/@piips/shared/metodo-generico/Buscar-Data-Extensao')
import CrudDocumentoBaseRepository from '../../documento/repositories/crud-base-repositorio';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository'
// import BaseRepository from 'App/@piips/core/repository/BaseRepository'
// import BaseRepository from 'App/@piips/core/repository/BaseRepository'

const validar = require('../validation/validar')

interface IInput {
  pessoafisica_id: number
  pessoajurifica_id: number
  situacao: string
  sigpq_acto_nomeacao_id: number
  sigpq_tipo_cargo_id: number
  // numero_ordem_nomeacao: string
  numero_despacho_nomeacao: string
  // data_ordem_nomeacao: string
  data_despacho_nomeacao: string
  patente_id: number
  user_id: number
}

const dateTime = new Date()

// const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_funcaos');

export default class CrudRepository extends BaseModuloRepository {
  #crudDocumentoBaseRepository
  constructor() {
    super('sigpq_cargos')
    this.#crudDocumentoBaseRepository = new CrudDocumentoBaseRepository()
  }

  public async editarData(input: any, id: number, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()
    let _numero_despacho;
    try {
      //const numeroUnico = await this.#numeroUnico.gerarNumeroDataAutomatico();
      _numero_despacho = input.numero_despacho
          ? extensao_despacho(input?.despacho_data, input.numero_despacho)
          : null;

      const sigpq_cargo = {
        numero_ordem: input.numero_ordem,
        numero_despacho: _numero_despacho,
      };

      await Database.from('sigpq_cargos')
        .where("id", id)
        .update(sigpq_cargo)
        .useTransaction(trx);

      return await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      return Error('Não foi possível atualizar Provimento.');
    }

  }

  public async registar(input: IInput, file: any, trx: any = null): Promise<any> {
    trx = trx ?? await Database.transaction()
    const valido = await validar(input)
    // input.situacao == situacao.ACTUAL ? validarFuncaoActual(input) : validarFuncaoExercida(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }


    try {
      const file_ = file.file('anexo_nomeacao')
      const anexo = file_ ? await uploadFile(input.pessoafisica_id + '/individual', file_) : null;

      const pf = await this.buscarPessoaPorUserId(input?.user_id)
      const pessoa_id = pf.pessoa_id

      const passaporte = {
        anexo: anexo,
        nid: 'Profissional',
        pessoafisica_id: pessoa_id,
        user_id: input.user_id,
        sigpq_tipo_documento_id: 21,

      }

      const resultadoPassaporte = await this.#crudDocumentoBaseRepository.registar(passaporte, trx)
      const inputCargo: any = {
        ...valido,
        sigpq_documento_id:resultadoPassaporte,
        numero_despacho: extensao_despacho(input?.data_despacho_nomeacao, input?.numero_despacho_nomeacao),
        numero_ordem: input?.numero_despacho_nomeacao,
        // situacao: this.getSituacao(input.situacao),
        activo: input.situacao == 'exercída' ? 0 : 1,
        data: input?.data_despacho_nomeacao,
        // anexo,
        created_at: dateTime,
        updated_at: dateTime
      }

      delete inputCargo['data_despacho_nomeacao']
      delete inputCargo['data_ordem_nomeacao']
      delete inputCargo['numero_despacho_nomeacao']
      delete inputCargo['numero_ordem_nomeacao']

      // console.log(inputCargo)




      await Database.insertQuery().useTransaction(trx).table('sigpq_cargos').insert(inputCargo)

      return trx.commit()
      Error('hellow')

    } catch (e) {
      console.log(e);
      // await deleteDirectory(input.pessoafisica_id + '/anexo-guia')
      return Error('Não foi possível criar registo.');
    }
  }

  public async buscarPessoaPorUserId(id: any): Promise<any> {
    return id ? await Database.from({ u: 'users' })
      .select('u.pessoa_id ')
      .where('u.id', id)
      .where('u.eliminado', false)
      .where('u.activo', true)
      .first() : null
  }
  public async listarTodos(options: any): Promise<any> {
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ c: 'sigpq_cargos' })
        .select(
          'c.id',
          Database.raw("DATE_FORMAT(c.data, '%d/%m/%Y') as data"),

          'c.situacao',
          'c.pessoafisica_id',
          'c.pessoajuridica_id',
          'tc.id as sigpq_tipo_cargo_id',
          'tc.nome',
          'c.activo',
          "c.sigpq_documento_id",
          "sigpq_documentos.anexo",
          // 'c.anexo',
          // 'c.numero_ordem',
          Database.raw('upper(p.nome_completo) as direcao'),
          'pj.sigla as direcao_sigla',
          'c.numero_despacho',
          'an.id as sipq_acto_nomeacao_id',
          'an.nome as acto_nomeacao',
          'pt.id as patente_id',
          'pt.nome as patente',
          'pt.classe as patente_classe',

          Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
        )
        .innerJoin('sigpq_tipo_cargos as tc', 'tc.id', 'c.sigpq_tipo_cargo_id')
        .leftJoin('pessoajuridicas as pj', 'pj.id', 'c.pessoajuridica_id')
        .leftJoin('pessoas as p', 'p.id', 'c.pessoajuridica_id')
        .leftJoin('patentes as pt', 'pt.id', 'c.patente_id')
        .leftJoin('sigpq_acto_nomeacaos as an', 'an.id', 'c.sigpq_acto_nomeacao_id')
        .leftJoin(
          "sigpq_documentos",
          "sigpq_documentos.id",
          "c.sigpq_documento_id"
        )
        // .sigpq_tipo_funcaos
        .where('c.eliminado', false)
        // .orderBy('c.data', 'asc')
        .orderBy('c.activo', 'desc')
        //

        .where(query => {
          if (options.pessoafisica_id) {
            query.where('c.pessoafisica_id', options.pessoafisica_id)
          }
        })
        .where(query => {
          if (options.search) {
            query.where('tc.nome', 'like', `%${options.search}%`)
            query.orWhere('pt.nome', 'like', `%${options.search}%`)
            query.orWhere('an.nome', 'like', `%${options.search}%`)
            query.orWhere('pj.sigla', 'like', `%${options.search}%`)
            query.orWhere('pj.orgao_comando_provincial', 'like', `%${options.search}%`)
            query.orWhere('p.nome_completo', 'like', `%${options.search}%`)
            query.orWhere('c.situacao', 'like', `%${options.search}%`)
            query.orWhere('c.numero_ordem', 'like', `%${options.search}%`)
            // query.orWhere('c.numero_despacho', 'like', `%${options.search}%`)

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

  private getSituacao(situacao: string, provimento: boolean = false) {

    if (!provimento) {
      const situacaos = {
        'actual': 'actual',
        'anterior': 'exercída'
      }
      return situacaos.hasOwnProperty(situacao) ? situacaos[situacao] : ''
    } else {
      const situacaos = {
        'actual': 'actual',
        'anterior': 'anterior'
      }
      return situacaos.hasOwnProperty(situacao) ? situacaos[situacao] : ''
    }
  }


  public async listarUm(id: any): Promise<any> {

    try {

      let query: any = Database.from({ f: 'sigpq_cargos' })
        .select(
          'c.id',
          'c.data_inicio',
          'c.data_fim',
          'c.situacao',
          'c.pessoafisica_id',
          'c.pessoajuridica_id',
          'pj.sigla as sigla_orgao',
          'p.nome_completo as orgao',
          'tc.id as sigpq_tipo_cargo_id',
          'tc.nome',
          'c.activo',
          'c.observacao',
          Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .innerJoin('sigpq_tipo_cargos as tf', 'tc.id', 'c.sigpq_tipo_cargo_id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'c.pessoajuridica_id')
        .innerJoin('pessoas as p', 'p.id', 'pj.id')

        .where('c.eliminado', false)
        .orderBy('tc.created_at')
        .where('c.id', id).first()

      return await query



    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }
  }



}
