import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';

export default class CrudBaseRepository {

  public async registar(input: any): Promise<any> {

    const dateTime = new Date()

    if (!input.nome_completo) {
      return Error('O campo Nome é obrigatório.')
    }

    // if (!input.nif) {
    //   return Error('O campo Nif é obrigatório.')
    // }

    if (!input.sigla) {
      return Error('O campo Sigla é obrigatório.')
    }

    if (!input.user_id) {
      return Error('Utilizador não está logado')
    }

    if (!input.pessoajuridica_id) {
      return Error('O campo entidade é obrigatório.')
    }

    if (!input.tipo_pessoajuridica_id) {
      return Error('O campo Tipo de entidade é obrigatório.')
    }

    // if (await this.buscarNif(input.nif)) {
    //   return Error('Número do NIF já existe')
    // }

    const trx = await Database.transaction()

    try {

      const pessoa = {
        nome_completo: input.nome_completo.toString().trim().toUpperCase(),
        tipo: 'pj',
        activo: input.activo ? 1 : 0,
        user_id: input.user_id,
        created_at: dateTime,
        updated_at: dateTime
      }

      const pessoaId = await Database
        .table('pessoas')
        .useTransaction(trx)
        .insert(pessoa)

      const pessoaJuridica = {
        id: pessoaId,
        nif: input.nif,
        sigla: input.sigla.toString().trim().toUpperCase(),
        site: input.site,
        user_id: input.user_id,
        logotipo: input.logotipo,
        pessoajuridica_id: input.pessoajuridica_id,
        tipo_pessoajuridica_id: input.tipo_pessoajuridica_id,
        orgao_comando_provincial: input.orgao_comando_provincial,
        descricao: input.descricao,
        created_at: dateTime,
        updated_at: dateTime,
      }

      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table('pessoajuridicas')
        .useTransaction(trx)
        .insert(pessoaJuridica)

      return await trx.commit()

    } catch (e) {
      await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }
  public async editar(id: any, input: any): Promise<any> {

    const dateTime = new Date()

    if (!input.nome_completo) {
      return Error('O campo Nome é obrigatório.')
    }

    // if (!input.nif) {
    //   return Error('O campo Nif é obrigatório.')
    // }

    if (!input.sigla) {
      return Error('O campo Sigla é obrigatório.')
    }

    if (!input.user_id) {
      return Error('Utilizador não está logado')
    }

    if (!input.pessoajuridica_id) {
      return Error('O campo entidade é obrigatório.')
    }

    if (!input.tipo_pessoajuridica_id) {
      return Error('O campo Tipo de entidade é obrigatório.')
    }

    // if (await this.buscarNif(input.nif)) {
    //   return Error('Número do NIF já existe')
    // }

    const trx = await Database.transaction()

    try {

      const pessoa = {
        nome_completo: input.nome_completo.toString().trim().toUpperCase(),
        tipo: 'pj',
        activo: input.activo ? 1 : 0,
        user_id: input.user_id,
        // created_at: dateTime,
        updated_at: dateTime
      }

      await Database.from('pessoas').update(pessoa).useTransaction(trx).where('id', id)
      // const pessoaId = await Database
      //   .table('pessoas')
      //   .useTransaction(trx)
      //   .insert(pessoa)

      const pessoaJuridica = {

        nif: input.nif,
        sigla: input.sigla.toString().trim().toUpperCase(),
        site: input.site,
        user_id: input.user_id,
        logotipo: input.logotipo,
        pessoajuridica_id: input.pessoajuridica_id,
        tipo_pessoajuridica_id: input.tipo_pessoajuridica_id,
        orgao_comando_provincial: input.orgao_comando_provincial,
        descricao: input.descricao,
        // created_at: dateTime,
        updated_at: dateTime,
      }

      await Database.from('pessoajuridicas').update(pessoaJuridica).where('id', id).useTransaction(trx)

      // await Database
      //   .insertQuery() // 👈 gives an instance of insert query builder
      //   .table('pessoajuridicas')
      //   .useTransaction(trx)
      //   .insert(pessoaJuridica)

      return await trx.commit()

    } catch (e) {
      await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }

  public async listarTodos(options: any): Promise<any> {
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ pj: 'pessoajuridicas' })
        .select(
          'p.id',
          Database.raw('upper(p.nome_completo) as nome_completo'),
          'p.user_id',
          'p.activo',
          'pj.nif',
          'pj.site',
          'pj.sigla',
          'pj.logotipo',
          'pj.tipo_pessoajuridica_id',
          'pj.orgao_comando_provincial',
          'pj.descricao',
          'pjo.sigla as orgao_sigla',
          'pjo.tipo_estrutura_organica_sigla',
          Database.raw('upper(po.nome_completo) as orgao'),
          'pjo.id as pessoajuridica_id',
          Database.raw('upper(tpj.nome) as tipo_pessoajuridica_nome'),
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")

        )
        .innerJoin('pessoas as p', 'p.id', 'pj.id')
        .innerJoin('tipo_pessoajuridicas as tpj', 'tpj.id', 'pj.tipo_pessoajuridica_id')
        .innerJoin('pessoajuridicas as pjo', 'pjo.id', 'pj.pessoajuridica_id')
        .innerJoin('pessoas as po', 'po.id', 'pjo.id')
        .orderBy('p.created_at', 'desc').orderBy('p.nome_completo', 'desc')
        .where('p.eliminado', false)
        .where((query: any) => {
          if (options.pessoajuridica_id) {
        
            query.where('pj.pessoajuridica_id', options.pessoajuridica_id)
          }
        })
        .where((query: any) => {
          if (options.entidade) {
            query.where('tpj.nome', options.entidade)
          } else {
            query.whereIn('tpj.nome', ['Departamento', 'Comando Municipal', 'Unidade'])
          }
        })
        .where((query: any) => {
          if (options.tipoOrgao) {
            query.where('pjo.tipo_estrutura_organica_sigla', options.tipoOrgao)
          }
        })
        .where((query: any) => {
          if (options.estado) {
            let status = Number(options?.estado) == 2 ? true : false
            query.where('p.activo', status)
          }
        })
        .where(function (item: any): void {
          if (options.search) {
            item.where('p.nome_completo', 'like', `%${options.search}%`)
            item.orWhere('pj.sigla', 'like', `%${options.search}%`)
            item.orWhere('tpj.nome', 'like', `%${options.search}%`)
            item.orWhere('po.nome_completo', 'like', `%${options.search}%`)
            item.orWhere('pjo.sigla', 'like', `%${options.search}%`)

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

  public async buscarNif(n: any) {
    return n ? await Database.from('pessoajuridicas').where('nif', n).first() : null
  }

}
