import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';
const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

const { uploadFile, deleteDirectory } = require('App/@piips/shared/metodo-generico/Upload-Or-Read-File')

export default class CrudBaseRepository extends BaseModuloRepository {

  constructor() {
    super('sigpq_assinatura_digitals');
  }

  public async registar(input: any, file: any, trxParam = null): Promise<any> {
    let validate = []
    try {
      const camposDesejados: (keyof any)[] = ['pessoafisica_id', 'user_id', 'pessoajuridica_id'];

      validate = mapearCampos(input, camposDesejados, [
        'assinatura',
        'activo',
        'eliminado'
      ]);

    } catch (error) {

      return Error(error.message)
    }

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()



    try {

      await Database.from('sigpq_assinatura_digitals').where('activo', true).where('pessoafisica_id', input.pessoafisica_id).update({
        activo: false
      }).useTransaction(trx)

      const file_ = file.file('assinatura')
      const assinatura = file_ ? await uploadFile(input.pessoafisica_id + '/assinatura-digital', file_) : null
      const assinaturaInput = {
        ...validate,
        assinatura,
        created_at: dateTime,
        updated_at: dateTime
      }

      await Database
        .table('sigpq_assinatura_digitals')
        .useTransaction(trx)
        .insert(assinaturaInput)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      await deleteDirectory(input.pessoafisica_id + '/assinatura-digital')
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }
  public async editar(input: any, file: any, id: any, trxParam = null): Promise<any> {
    let validate = []
    try {
      const camposDesejados: (keyof any)[] = ['pessoafisica_id', 'user_id', 'pessoajuridica_id'];

      validate = mapearCampos(input, camposDesejados, [
        'assinatura',
        'activo',
        'eliminado'
      ]);

    } catch (error) {

      return Error(error.message)
    }

    const dateTime = new Date()

    const trx = trxParam ? trxParam : await Database.transaction()

    try {


      let assinatura: any = ''
      if (file.file('assinatura')) {
        const file_ = file.file('assinatura')
        assinatura = file_ ? await uploadFile(input.pessoafisica_id + '/assinatura-digital', file_) : null
      } else {
        assinatura = input.assinatura
      }
      const assinaturaInput = {
        ...validate,
        assinatura,
        created_at: dateTime,
        updated_at: dateTime
      }

      await Database
        .from('sigpq_assinatura_digitals')
        .useTransaction(trx)
        .where('id', id)
        .update(assinaturaInput)

      return trxParam ? trxParam : await trx.commit()

    } catch (e) {
      await deleteDirectory(input.pessoafisica_id + '/assinatura-digital')
      trxParam ? trxParam : await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }


  public async listarTodos(options: any): Promise<any> {

    try {

      const query: DatabaseQueryBuilderContract = Database.from({ ad: 'sigpq_assinatura_digitals' })
        .select(
          "ad.id",
          "ad.activo",
          "ad.pessoajuridica_id",
          "ad.pessoafisica_id",
          "ad.assinatura",
          "f.nip",
          'f.numero_agente',
          'patentes.nome as patente',
          "patentes.classe as categoria_carreira",
          "pessoafisica.nome_completo as nome_completo",
          "pessoajuridica.nome_completo as pessoajuridica",
          "pj.tipo_estrutura_organica_sigla as tipo_estrutura_organica_sigla",

          'u.id as user_id',
          'u.username',
          'u.email',
          'u.pessoa_id as user_pessoa_id',
          "uf.nip as unip",
          'uf.numero_agente as unumero_agente',
          'upatentes.nome as upatente',
          "upessoafisica.nome_completo as unome_completo",
          "upatentes.classe as ucategoria_carreira",

          Database.raw("DATE_FORMAT(ad.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(ad.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('sigpq_funcionarios as f', 'f.id', 'ad.pessoafisica_id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'ad.pessoajuridica_id')
        .innerJoin('pessoas as pessoajuridica', 'pessoajuridica.id', 'pj.id')
        .innerJoin('pessoas as pessoafisica', 'pessoafisica.id', 'f.id')
        .innerJoin('sigpq_provimentos ', 'sigpq_provimentos.pessoa_id', 'f.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('users as u', 'u.id', 'ad.user_id')

        .innerJoin('sigpq_funcionarios as uf', 'uf.id', 'u.pessoa_id')
        .innerJoin('pessoas as upessoafisica', 'upessoafisica.id', 'uf.id')
        .innerJoin('sigpq_provimentos as usigpq_provimentos', 'usigpq_provimentos.pessoa_id', 'uf.id')
        .innerJoin('patentes as upatentes', 'upatentes.id', 'usigpq_provimentos.patente_id')
        .where('ad.eliminado', false)
        .orderBy('ad.created_at', 'desc')
        .where((query: any) => {
          if (options.pessoafisica_id) {
            query.where('ad.pessoafisica_id', options.pessoafisica_id)
            query.orderBy('activo', 'desc')
          } else {
            {
              query.where('ad.activo', true)
            }
          }
        })
        .where((query: any) => {
          if (options.pessoajuridica_id) {
            query.where('ad.pessoajuridica_id', options.pessoajuridica_id)
          }
        }).where(query => {
          if (options.patente) {
            query.where('upatentes.nome', options.patente)
          }
        })

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
