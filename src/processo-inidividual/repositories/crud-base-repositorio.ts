import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';
const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

const { uploadFile, deleteDirectory } = require('App/@piips/shared/metodo-generico/Upload-Or-Read-File')

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('sigpq_documentos');
  }

  public async registar(input: any, file: any, trxParam = null): Promise<any> {
    let validate = []
    try {
      const camposDesejados: (keyof any)[] = ['nid', 'pessoafisica_id', 'user_id', 'sigpq_tipo_documento_id','activo'];

      validate = mapearCampos(input, camposDesejados, [
        'anexo',
        'data_expira',
        'local_emissao',
        'data_emissao',
      ]);

    } catch (error) {
      console.log(error.message);
      return Error(error.message)
    }

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()



    try {
      const pi = file.file('anexo')
      const anexo = pi ? await uploadFile(input.pessoafisica_id + '/individual', pi) : null

      const documento = {

        ...validate,
        anexo,
        local_emissao: input?.local_emissao,
        data_emissao: input?.data_emissao,
        data_expira: input?.data_expira,
        created_at: dateTime,
        updated_at: dateTime
      }

      await Database
        .table('sigpq_documentos')
        .useTransaction(trx)
        .insert(documento)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      await deleteDirectory(input.pessoafisica_id + '/individual')
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }

  public async editar(id: any, input: any, file: any, trxParam = null): Promise<any> {
    let validate = []
    try {

      const camposDesejados: (keyof any)[] = ['nid', 'pessoafisica_id', 'user_id',];

      validate = mapearCampos(input, camposDesejados, [
        'anexo',
        'data_expira',
        'local_emissao',
        'data_emissao',
      ]);

    } catch (error) {
      console.log(error.message);
      return Error(error.message)
    }

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()

    try {

      let anexo: any = null

      if (input?.anexo) {
        anexo = input?.anexo
      } else {
        const pi = file.file('anexo')
        anexo = pi ? await uploadFile(input.pessoafisica_id + '/individual', pi) : null
      }


      const documento = {
        ...validate,
        anexo,
        local_emissao: input?.local_emissao,
        data_emissao: input?.data_emissao,
        data_expira: input?.data_expira,
        updated_at: dateTime
      }
      await Database
        .from('sigpq_documentos')
        .useTransaction(trx)
        .where('id', id)
        .where('eliminado', false)
        .update(documento)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }

  public async activo(id: any, input: any, trxParam = null): Promise<any> {
    let validate = []
    try {

      const camposDesejados: (keyof any)[] = ['activo'];

      validate = mapearCampos(input, camposDesejados, [
        '',
      ]);

    } catch (error) {
      console.log(error.message);
      return Error(error.message)
    }

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()

    try {

      const curso = {
        ...validate,
        updated_at: dateTime
      }
      await Database
        .from('sigpq_documentos')
        .useTransaction(trx)
        .where('id', id)
        .where('eliminado', false)
        .update(curso)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível editar um novo registo.');
    }

  }

  

  public async listarTodos(options: any): Promise<any> {
    
    try {

      const query: DatabaseQueryBuilderContract = Database.from({ d: 'sigpq_documentos' })
        .select(
          "d.id",
          "d.nid",
          "d.anexo",
          "d.local_emissao",
          "d.data_emissao",
          "d.data_expira",
          "d.pessoafisica_id",
          "d.activo",
          "d.sigpq_tipo_documento_id",
          "sigpq_tipo_documentos.nome as sigpq_tipo_documento_nome",
          "d.descricao",
          Database.raw("DATE_FORMAT(d.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(d.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('sigpq_tipo_documentos', 'sigpq_tipo_documentos.id', 'd.sigpq_tipo_documento_id')
        .where('d.eliminado', false)
        .orderBy('d.created_at', 'desc')
        .where((query: any) => {
          if (options.pessoafisica_id) {
            query.where('d.pessoafisica_id', options.pessoafisica_id)
          }
          
          
        })
        .where((query: any) => {
          if (options.activo) {
            query.where('d.activo', options.activo)
          }

        })
        .where(function (item: any): void {
          if (options.search) {
            item.where('sigpq_tipo_documentos.nome', 'like', `%${options.search}%`)
            item.orWhere('d.nid', 'like', `%${options.search}%`)

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

  public async eliminar(id: any, trxParam = null): Promise<any> {

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()

    try {

      const documento = {
        eliminado: true,
        updated_at: dateTime
      }

      await Database
        .from('sigpq_documentos')
        .useTransaction(trx)
        .where('id', id)
        .update(documento)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }

  public async listarTodosPorPessoa(idPessoa: any): Promise<any> {
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ d: 'sigpq_documentos' })
        .select(
          'd.id',
          'p.nome_completo',
          'd.nid',
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")

        )
        .innerJoin('pessoas as p', 'p.id', 'd.pessoafisica_id')
        .where('d.eliminado', false)
        .where('p.id', idPessoa)

      return await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
