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
      const camposDesejados: (keyof any)[] = ['pessoafisica_id', 'user_id', 'ano_inicio','cargo','ano_fim',
        'tipo_de_contrato', 'empresa'];
      validate = mapearCampos(input, camposDesejados, [
        'anexo'
      ]);

    } catch (error) {
      return Error(error.message)
    }

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()



    try {
      const pi = file.file('anexo')
      const anexo = pi ? await uploadFile(input.pessoafisica_id + '/certificado', pi) : null

      const curso = {
        ...validate,
        anexo,
        created_at: dateTime,
        updated_at: dateTime
      }

      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table('sigpq_historico_empregos_pessoa_fisica')
        .useTransaction(trx)
        .insert(curso)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      // await deleteDirectory(input.pessoafisica_id + '/individual')
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }

  public async editar(id: any, input: any, file: any, trxParam = null): Promise<any> {
    let validate = []
    try {

      const camposDesejados: (keyof any)[] = ['pessoafisica_id', 'user_id', 'ano_inicio','cargo','ano_fim',
        'tipo_de_contrato', 'empresa'];
      validate = mapearCampos(input, camposDesejados, [
        'anexo',
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
        anexo = pi ? await uploadFile(input.pessoafisica_id + '/certificado', pi) : null

      }

      const curso = {
        ...validate,
        anexo,
        updated_at: dateTime
      }

      await Database
        .from('sigpq_historico_empregos_pessoa_fisica')
        .useTransaction(trx)
        .where('id', id)
        .where('activo', true)
        .where('eliminado', false)
        .update(curso)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível editar um novo registo.');
    }

  }

  public async listarUm(id: any): Promise<any> {

    try {

      const query: any = Database.from({ c: 'sigpq_historico_empregos_pessoa_fisica' })
      .select(

        'c.id',
        'c.anexo',
        'c.pessoafisica_id',
        'c.cargo',
        // 'sigpq_empresas.nome as empresa',
        'c.ano_inicio',
        'c.ano_fim',
        'c.tipo_de_contrato',
        'c.empresa',
        'c.activo',
        Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
        Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
      )
      // .leftJoin('sigpq_empresas', 'sigpq_empresas.id', 'c.empresa_id')
      .where('c.id', id)
        .orderBy('c.created_at', 'desc')

      return await query


    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }
  public async listarTodos(options: any): Promise<any> {

    try {

      const query: any = Database.from({ c: 'sigpq_historico_empregos_pessoa_fisica' })
      .select(

        'c.id',
        'c.anexo',
        'c.pessoafisica_id',
        'c.cargo',
        // 'sigpq_empresas.nome as empresa',
        // 'sigpq_empresas.id as empresa_id',
        'c.ano_inicio',
        'c.ano_fim',
        'c.tipo_de_contrato',
        'c.empresa',
        'c.activo',
        Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
        Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
      )
      .leftJoin('sigpq_empresas', 'sigpq_empresas.id', 'c.empresa_id')
      .orderBy('c.created_at', 'desc')
        .where((query: any) => {
          if (options.pessoafisica_id) {
            query.where('c.pessoafisica_id', options.pessoafisica_id)
          }
          if (options.empresa_id) {
            query.where('c.empresa_id', options.empresa_id)
          }
        })
        .where(function (item: any): void {
          if (options.search) {
            item.where('sigpq_empresas.nome', 'like', `%${options.search}%`)
            item.orWhere('c.tipo_de_contrato', 'like', `%${options.search}%`)

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
