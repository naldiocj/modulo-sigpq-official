import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';
const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('sigpq_documentos');
  }

  public async registar(input: any, trxParam = null): Promise<any> {
    let validate = []
    try {
      // const camposDesejados = ['nid', 'anexo', 'local_emissao', 'data_emissao', 'data_expira', 'pessoafisica_id', 'user_id', 'sigpq_tipo_documento_id'];
      const camposDesejados: (keyof any)[] = ['nid', 'pessoafisica_id', 'user_id', 'sigpq_tipo_documento_id'];

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
    const anexo = input['anexo'] ? input['anexo'] : null
    try {

      const documento = {
        ...validate,
        anexo,
        local_emissao: input?.local_emissao,
        data_emissao: input?.data_emissao,
        data_expira: input?.data_expira,
        created_at: dateTime,
        updated_at: dateTime
      }

      const doc = await Database
        .table('sigpq_documentos')
        .useTransaction(trx)
        .insert(documento)

      trxParam ? trxParam : await trx.commit()

      return doc

    } catch (e) {
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }

  public async editar(input: any, id: any, trxParam = null): Promise<any> {
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

      const documento = {
        ...validate,

        local_emissao: input?.local_emissao,
        data_emissao: input?.data_emissao,
        data_expira: input?.data_expira,
        updated_at: dateTime
      }

      await Database
        .from('sigpq_documentos')
        .useTransaction(trx)
        .where('id', id)
        .where('activo', true)
        .where('eliminado', false)
        .update(documento)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }

  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ pj: 'pessoajuridicas' })
        .select(
          'p.id',
          'p.nome_completo',
          'p.user_id',
          'p.activo',
          'pj.nif',
          'pj.site',
          'pj.sigla',
          'pj.logotipo',
          'pj.descricao',
          'tpj.nome as tipo_pessoajuridica_nome',
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")

        )
        .innerJoin('pessoas as p', 'p.id', 'pj.id')
        .innerJoin('tipo_pessoajuridicas as tpj', 'tpj.id', 'pj.tipo_pessoajuridica_id')
        .where('p.eliminado', false)

      if (options.pessoafisica) {
        query.where('pj.tipo_pessoajuridica_id', options.pessoafisica)
      }

      query.where(function (item: any): void {

        if (options.search) {
          item.where('p.nome_completo', 'like', `%${options.search}%`)
          item.orWhere('pj.nif', 'like', `%${options.search}%`)
          item.orWhere('pj.sigla', 'like', `%${options.search}%`)
          item.orWhere('tpj.nome', 'like', `%${options.search}%`)
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
