
import Database, { DatabaseQueryBuilderContract } from "@ioc:Adonis/Lucid/Database";
import BaseRepository from "App/@piips/core/repository/BaseRepository";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";

const validar = require('../validation/validar')

type IInput = {
  pessoajuridica_id: number,
  numero_oficio:string
  user_id: number,
  correspondencia_id:number
  nome_path: string
}

const { uploadFile, deleteDirectory } = require('App/@piips/shared/metodo-generico/Upload-Or-Read-File')
const documentoRepository = new BaseRepository<IInput>('sigpq_documento_correspondencias');
export default class CorrespondenciaDocumentoRepository extends BaseModuloRepository {


  constructor() {
    super('sigpq_documento_correspondencias')
  }

  public async registar(input: IInput, file: any, trx: any = null): Promise<any> {



    const valido = validar(input)

    let documento: string = '';
    let documento_url: string = ''
    if (['string'].includes(typeof valido)) {
      return Error(valido)
    }

    try {


      documento_url = input.pessoajuridica_id + '/' + input.nome_path;
      documento = file ? await uploadFile(documento_url, file) : null
      valido.anexo = documento

      console.log(valido)
   
      delete valido['pessoajuridica_id']
      await documentoRepository.registar(valido, trx)
    } catch (e) {
      await deleteDirectory(documento_url)
      console.log(e )
      return Error('Não foi possível registar documento')
    }
  }


  public async listarTodos(options: any): Promise<any> {
    try {

      const query: DatabaseQueryBuilderContract = Database.from({ doc: 'sigpq_sigpq_documento_correspondencias' })
        .select(
          'doc.id',
          'doc.anexo',
          'doc.nome',
          Database.raw("DATE_FORMAT(doc.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(doc.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
          'u.id as utente_id',
          'u.nid',
          'doc.porpna_candidato_id',
          'u.pessoa_id',
          'con.contacto'
        )
        .innerJoin('porpna_candidatos as c', 'c.id', 'doc.porpna_candidato_id')
        .innerJoin('porpna_utentes as u', 'u.id', 'c.porpna_utente_id')
        .innerJoin('sigpq_contactos as con', 'con.id', 'u.contacto_id')
        .where('doc.eliminado', false)
        .orderBy('doc.created_at', 'desc')
        .where(query => {
          if (options.nome) {
            query.where('doc.nome', options.nome)
          }
        })
        .where(query => {
          if (options.porpna_candidato_id) {
            query.where('doc.porpna_candidato_id', options.porpna_candidato_id)
          }
        })
        .where(query => {
          if (options.search) {
            query.where('doc.nome', `%${options.search}%`)
            query.orWhere('u.nid', `%${options.search}%`)
            query.orWhere('con.contacto', `%${options.search}%`)

          }
        })
      .clone()

      return options.page ? await query.paginate(options.page, options.perPage || 10) : await query

    } catch (e) {
      console.log(e)
      return Error('Não foi possível listar registos')
    }
  }

  public async listarUm(id: any): Promise<any> {
    try {

      const query: any = await Database.from({ doc: 'sigpq_sigpq_documento_correspondencias' })
        .select(
          'doc.id',
          'doc.anexo',
          'doc.nome',
          Database.raw("DATE_FORMAT(doc.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(doc.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
          'u.id as utente_id',
          'u.nid',
          'doc.porpna_candidato_id',
          'u.pessoa_id',
          'con.contacto'
        )
        .innerJoin('porpna_candidatos as c', 'c.id', 'doc.porpna_candidato_id')
        .innerJoin('porpna_utentes as u', 'u.id', 'c.porpna_utente_id')
        .innerJoin('sigpq_contactos as con', 'con.id', 'u.contacto_id')
        .where('doc.eliminado', false)
        .orderBy('doc.created_at', 'desc')
        .where('doc.id', id)
        .first()

      return query

    } catch (e) {
      console.log(e)
      return Error('Não foi possível listar registos')
    }
  }

}
