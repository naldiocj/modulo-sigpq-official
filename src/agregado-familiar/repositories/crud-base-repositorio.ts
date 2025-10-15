import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';
const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

const { uploadFile, deleteFileUrl } = require('App/@piips/shared/metodo-generico/Upload-Or-Read-File')

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('sigpq_documentos');
  }

  public async registar(input: any, file: any, trxParam = null): Promise<any> {
    let validate = []
    try {
      const camposDesejados: (keyof any)[] = ['nome', 'sigpq_tipo_familiar_id', 'pessoafisica_id', 'sigpq_tipo_documento_id', 'user_id','activo'];

      validate = mapearCampos(input, camposDesejados, [
        'anexo',
        'sigpq_tipo_documento_id',
        'activo'

      ]);

    } catch (error) {
      console.log(error.message);
      return Error(error.message)
    }

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()


    try { 
      const pip = file.file('anexo')
      const anexo = pip ? await uploadFile(input.pessoafisica_id + '/parente', pip) : null

      const familia = {
        ...validate,
        contacto: input?.contacto,
        data_de_nascimento: input?.data_de_nascimento,
        sigpq_tipo_documento_id: input?.sigpq_tipo_documento_id,
        anexo,
        created_at: dateTime,
        updated_at: dateTime
      }

      
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table('sigpq_familiars')
        .useTransaction(trx)
        .insert(familia)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      // await deleteFileUrl(input.pessoafisica_id + '/parente')
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      return Error('Não foi possível criar um novo registo.');
    }

  }
  public async editar(id: any, input: any, file: any, trxParam = null): Promise<any> {
    let validate = []
    try {
      const camposDesejados: (keyof any)[] = ['nome', 'sigpq_tipo_familiar_id', 'pessoafisica_id', 'sigpq_tipo_documento_id', 'user_id'];

      validate = mapearCampos(input, camposDesejados, [
        'anexo',
        'sigpq_tipo_documento_id',
        'activo'

      ]);

    } catch (error) {
      // console.log(error.message);
      return Error(error.message)
    }

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()

    try {
      let anexo: any
      if (input?.anexo) {
        anexo = input.anexo
      } else {
        const pip = file.file('anexo')
        console.log(input)
        anexo = pip ? await uploadFile(input.pessoafisica_id + '/parente', pip) : null
      }



      const familia = {
        ...validate,
        contacto: input?.contacto,
        data_de_nascimento: input?.data_de_nascimento,
        activo: 1,
        sigpq_tipo_documento_id: input?.sigpq_tipo_documento_id,
        anexo,
        updated_at: dateTime
      }
      await Database.from('sigpq_familiars').where('id', id).where('pessoafisica_id', input.pessoafisica_id).update(familia).useTransaction(trx)
      // await Database
      //   .insertQuery() // 👈 gives an instance of insert query builder
      //   .table('sigpq_familiars')
      //   .useTransaction(trx)
      //   .insert(familia)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      // await deleteFileUrl(input.pessoafisica_id + '/parente')
      trxParam ? trxParam : await trx.rollback()
      return Error('Não foi possível criar um novo registo.');
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

      await Database.from('sigpq_familiars').where('id', id).update(curso).useTransaction(trx)
      
      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível editar um novo registo.');
    }

  }

  // public async editar(input: any, id: any, trxParam = null): Promise<any> {
  //   let validate = []
  //   try {

  //     const camposDesejados: (keyof any)[] = ['nid', 'pessoafisica_id', 'user_id',];

  //     validate = mapearCampos(input, camposDesejados, [
  //       'anexo',
  //       'data_expira',
  //       'local_emissao',
  //       'data_emissao',
  //     ]);

  //   } catch (error) {
  //     console.log(error.message);
  //     return Error(error.message)
  //   }

  //   const dateTime = new Date()

  //   const trx = trxParam ? trxParam : await Database.transaction()

  //   try {

  //     const documento = {
  //       ...validate,
  //       local_emissao: input?.local_emissao,
  //       data_emissao: input?.data_emissao,
  //       data_expira: input?.data_expira,
  //       updated_at: dateTime
  //     }

  //     await Database
  //       .from('sigpq_documentos')
  //       .useTransaction(trx)
  //       .where('id', id)
  //       .where('activo', true)
  //       .where('eliminado', false)
  //       .update(documento)

  //     return trxParam ? trxParam : await trx.commit()

  //   } catch (e) {
  //     trxParam ? trxParam : await trx.rollback()
  //     console.log(e);
  //     throw new Error('Não foi possível criar um novo registo.');
  //   }

  // }

  public async listarTodos(options: any): Promise<any> {

    try {

      const query: DatabaseQueryBuilderContract = Database.from({ f: 'sigpq_familiars' })
        .select(
          'f.id',
          'f.nome',
          'f.contacto',
          Database.raw("DATE_FORMAT(f.data_de_nascimento, '%d/%m/%Y %H:%i:%s') as data_de_nascimento"),
          Database.raw("DATE_FORMAT(f.data_de_nascimento, '%Y/%m/%d') as data_nascimento_en"),
          'f.anexo',
          'f.activo',
          'sigpq_tipo_familiars.nome as sigpq_tipo_familiar_nome',
          'sigpq_tipo_documentos.nome as sigpq_tipo_documento_nome',
          'f.sigpq_tipo_familiar_id',
          'f.sigpq_tipo_documento_id',
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('sigpq_tipo_familiars', 'sigpq_tipo_familiars.id', 'f.sigpq_tipo_familiar_id')
        .innerJoin('sigpq_tipo_documentos', 'sigpq_tipo_documentos.id', 'f.sigpq_tipo_documento_id')
        .where('f.eliminado', false)
        .whereIn('sigpq_tipo_documentos.nome', ['Bilhete de Identidade', 'Boletim De Nascimento'])
        .orderBy('f.created_at', 'desc')
        .where((query: any) => {
          if (options.pessoafisica_id) {
            query.where('f.pessoafisica_id', options.pessoafisica_id)
          }
          if (options.activo) {
            query.where('f.activo', options.activo)
          }
        })
        .where(function (item: any): void {
          if (options.search) {
            item.where('sigpq_tipo_familiars.nome', 'like', `%${options.search}%`)
            item.orWhere('f.nome', 'like', `%${options.search}%`)
            item.orWhere('f.contacto', 'like', `%${options.search}%`)
            item.orWhere('sigpq_tipo_documentos.nome', 'like', `%${options.search}%`)

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
        .from('sigpq_familiars')
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
