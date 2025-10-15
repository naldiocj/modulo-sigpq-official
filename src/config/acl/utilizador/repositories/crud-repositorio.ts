import Hash from '@ioc:Adonis/Core/Hash'
import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import UserHelper from 'App/Helper/UserHelper'

const validar = require('./../validation/validar-editar')

interface Utilizador {
  username: string
  email: string
  password?: string
  notificar_por_email?: boolean
  forcar_alterar_senha?: boolean
  pessoa_id: number
  user_id: number
  role_id: number
  activo: boolean
  descricao?: string
  aceder_todos_agentes: boolean
  aceder_painel_piips: boolean
  aceder_departamento: boolean
  aceder_seccao: boolean
  aceder_posto_policial: boolean
}

// const utilizadorRepository = new BaseRepository<Utilizador>('users');

export default class CrudRepository {

  public async registar(input: Utilizador, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()
    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    if ((await this.buscarEmail(input.email)) && input.email) {
      return Error('Email já existe')
    }

    try {

      const salt = new UserHelper();

      const u = {
        username: input.username,
        email: input.email,
        password: await Hash.make(await salt.getSalt() + input.password),
        pessoa_id: input.pessoa_id,
        user_id: input.user_id,
        aceder_todos_agentes: input.aceder_todos_agentes,
        aceder_painel_piips: input.aceder_painel_piips,
        aceder_departamento: input.aceder_departamento,
        aceder_seccao: input.aceder_seccao,
        aceder_posto_policial: input.aceder_posto_policial,
        created_at: new Date(),
        updated_at: new Date()
      }


      const user = await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table('users')
        .useTransaction(trx)
        .insert(u)

      const utilizador_role = {
        role_id: input.role_id,
        user_id: user,
        created_at: new Date(),
        updated_at: new Date(),
      }

      if (trx) {
        await Database
          .insertQuery() // 👈 gives an instance of insert query builder
          .table('user_roles')
          .useTransaction(trx)
          .insert(utilizador_role)
        trx.commit()
      } else {
        await Database
          .insertQuery() // 👈 gives an instance of insert query builder
          .table('user_roles')
          .insert(utilizador_role)
      }

      return user
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo utilizador.');
    }
  }

  public async editar(input: Utilizador, id: any, trx: any = null): Promise<any> {

    trx = trx ?? await Database.transaction()
    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    if ((await this.buscarEmailDiff(id, input.email)) && input.email) {
      return Error('Email já existe')
    }

    try {

      // const salt = new UserHelper();

      const u = {
        username: input.username,
        email: input.email,
        // password: await Hash.make(await salt.getSalt() + input.password),
        pessoa_id: input.pessoa_id,
        user_id: input.user_id,
        aceder_todos_agentes: input.aceder_todos_agentes,
        aceder_painel_piips: input.aceder_painel_piips,
        aceder_departamento: input.aceder_departamento,
        aceder_seccao: input.aceder_seccao,
        aceder_posto_policial: input.aceder_posto_policial,
        // created_at: new Date(),
        updated_at: new Date()
      }

      const user = await Database.from('users').where('id', id).update(u).useTransaction(trx)

      const utilizador_role = {
        role_id: input.role_id,
        user_id: id,
        created_at: new Date(),
        updated_at: new Date(),
      }

      if (trx) {
        await Database.from('user_roles').useTransaction(trx).update(utilizador_role).where('user_id', id)
        trx.commit()
      } else {
        await Database.from('user_roles').update(utilizador_role).where('user_id', id)
      }

      return user
    } catch (e) {
      console.log(e);
      return Error('Não foi possível actualizar o utilizador.');
    }
  }

  public async listarTodos(options: any): Promise<any> {


    try {

      let query: DatabaseQueryBuilderContract = Database.from({ u: 'users' })

        .select(
          'u.id',
          Database.raw('upper(u.username) as username'),
          'u.email',
          'u.forcar_alterar_senha',
          'u.aceder_departamento',
          'u.aceder_posto_policial',
          'u.aceder_seccao',
          'u.activo',
          Database.raw("upper(pessoas.nome_completo) as nome_completo"),
          Database.raw(`
            CASE
              WHEN u.aceder_todos_agentes = 0 THEN false
              ELSE true
            END AS aceder_todos_agentes
          `),
          'pessoas.id as funcionario_id',
          'modulos.id as modulo_id',
          Database.raw("upper(modulos.nome) as modulo_nome"),
          'roles.id as role_id',
          'roles.nome as role_nome',
          Database.raw('upper(pp.nome_completo) as orgao'),
          'pj.sigla',
          Database.raw("DATE_FORMAT(u.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(u.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .innerJoin('pessoas', 'pessoas.id', 'u.pessoa_id')
        .innerJoin('user_roles', 'user_roles.user_id', 'u.id')
        .innerJoin('roles', 'roles.id', 'user_roles.role_id')
        .innerJoin('modulos', 'modulos.id', 'roles.modulo_id')
        .innerJoin('sigpq_funcionario_orgaos as sfo', 'sfo.pessoafisica_id', 'pessoas.id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'sfo.pessoajuridica_id')
        .innerJoin('pessoas as pp', 'pp.id', 'pj.id')
        .where('sfo.nivel_colocacao', 'muito-alto')
        .where('pessoas.eliminado', false)
        .where('sfo.activo', true)
        .where('sfo.eliminado', false)
        .where('u.eliminado', false)
        .whereNot('u.username', 'Root')
        .orderBy('pessoas.nome_completo')
        .where(query => {
          if (options.moduloId) {
            query.where('modulos.id', options.moduloId)
          }

        })
        .where(query => {
          if (options.orgaoId) {
            query.where('pj.id', options.orgaoId)
          }
        })


        .where(query => {
          if (options.estado) {
            let status = Number(options?.estado) == 2 ? true : false
            query.where('u.activo', status)
          }
        })


        .where((query: any) => {
          if (options.search) {
            query.where('pessoas.nome_completo', 'like', `%${options.search}%`)
            query.orWhere('u.username', 'like', `%${options.search}%`)
            query.orWhere('u.email', 'like', `%${options.search}%`)
            query.orWhere('modulos.nome', 'like', `%${options.search}%`)
            query.orWhere('pp.nome_completo', 'like', `%${options.search}%`)
            query.orWhere('pj.sigla', 'like', `%${options.search}%`)
          }

        })



      if (options.modulo_slug) {
        query.where('modulos.nome', 'like', `%${options.search}%`)
      }


      const result= options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query
        return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async buscarEmail(n: any): Promise<any> {
    return n ? await Database.from({ u: 'users' })
      .where('u.email', n)
      .where('u.eliminado', false)
      .first() : null
  }

  public async buscarEmailDiff(id: any, n: any): Promise<any> {
    return n ? await Database.from({ u: 'users' })
      .where('u.email', n)
      .where('u.eliminado', false)
      .where('id', '<>', id)
      .first() : null
  }

  public async alterarSenha(user: any, password: any, novaPassword: any): Promise<any> {

    const salt = new UserHelper();

    try {

      if (!(await Hash.verify(user.password, await salt.getSalt() + password))) {
        return Error('Credenciais inválida !')
      }

      const newUser = await Database
        // .insertQuery() // 👈 gives an instance of insert query builder
        .from('users')
        .where('id', user.id)
        .update({
          password: await Hash.make(await salt.getSalt() + novaPassword),
          forcar_alterar_senha: false,
          updated_at: new Date()
        })

      return newUser

    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo utilizador.');
    }
  }

  public async eliminar(id: any, user_id: any, trx: any = null): Promise<any> {
    trx = trx ?? await Database.transaction()
    try {

      const query = await Database.from('users').select('*').where('eliminado', false).where('id', id).first()

      if (!query) {
        return Error(' Utilizador não encontrado')
      }

      await Database.from('users').where('id', id).where('eliminado', false).update({
        eliminado: true,
        user_id
      }).useTransaction(trx)

      return await trx.commit()

    } catch (e) {
      console.log(e)
      await trx.rollback()
      return Error('Não foi possível encontrar o utilizador')
    }
  }

}
