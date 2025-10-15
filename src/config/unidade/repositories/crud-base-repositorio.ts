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

    console.log(input)

    if (!input.sigla) {
      return Error('O campo Sigla é obrigatório.')
    }

    if (!input.user_id) {
      return Error('Utilizador não está logado')
    }

    if (!input.seccao_id) {
      return Error('O campo entidade é obrigatório.')
    }

    if (!input.tipo_pessoajuridica_id) {
      return Error('O campo Tipo de entidade é obrigatório.')
    }
    if (!input.orgao_comando_provincial) {
      return Error('O campo Tipo de entidade é obrigatório.')
    }

    // if (await this.buscarNif(input.nif)) {
    //   return Error('Número do NIF já existe')
    // }

    const trx = await Database.transaction()

    try {

      const pessoa = {
        nome_completo: input.nome_completo,
        tipo: 'pj',
        activo: input.activo,
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
        // nif: input.nif,
        sigla: input.sigla,
        // site: input.site,
        // logotipo: input.logotipo,
        pessoajuridica_id: input.seccao_id,
        tipo_pessoajuridica_id: input.tipo_pessoajuridica_id,
        orgao_comando_provincial: input.orgao_comando_provincial,
        activo: input.activo,
        user_id: input.user_id,
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

    if (!input.seccao_id) {
      return Error('O campo entidade é obrigatório.')
    }

    if (!input.tipo_pessoajuridica_id) {
      return Error('O campo Tipo de entidade é obrigatório.')
    }
    if (!input.orgao_comando_provincial) {
      return Error('O campo Tipo de entidade é obrigatório.')
    }

    // if (await this.buscarNif(input.nif)) {
    //   return Error('Número do NIF já existe')
    // }

    const trx = await Database.transaction()

    try {

      const pessoa = {
        nome_completo: input.nome_completo,
        tipo: 'pj',
        activo: input.activo,
        user_id: input.user_id,
        // created_at: dateTime,
        updated_at: dateTime
      }

      await Database
        .from('pessoas')
        .useTransaction(trx)
        .update(pessoa)
        .where('id', id)

      const pessoaJuridica = {
        // id: pessoaId,
        // nif: input.nif,
        sigla: input.sigla,
        // site: input.site,
        // logotipo: input.logotipo,
        pessoajuridica_id: input.pessoajuridica_id,
        tipo_pessoajuridica_id: input.tipo_pessoajuridica_id,
        orgao_comando_provincial: input.orgao_comando_provincial,
        activo: input.activo,
        user_id: input.user_id,
        descricao: input.descricao,
        // created_at: dateTime,
        updated_at: dateTime,
      }

      await Database
        // 👈 gives an instance of insert query builder
        .from('pessoajuridicas')
        .useTransaction(trx)
        .update(pessoaJuridica)
        .where('id', id)

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
          'p.user_id',
          'p.activo',
          'pj.logotipo',
          'pj.descricao',
          Database.raw('upper(pj.sigla) as sigla'),
          Database.raw('upper(p.nome_completo) as nome_completo'),
          'pj.tipo_pessoajuridica_id',
          'pj.orgao_comando_provincial',


          Database.raw('upper(pjo.sigla) as seccao_sigla'),
          Database.raw('upper(po.nome_completo) as seccao'),
          'po.id as seccao_id',

          Database.raw('upper(pjoo.sigla) as departamento_sigla'),
          Database.raw('upper(poo.nome_completo) as departamento'),
          'pjoo.id as departamento_id',


          Database.raw('upper(pjooo.sigla) as orgao_sigla'),
          Database.raw('upper(pooo.nome_completo) as orgao'),
          'pjooo.id as orgao_id',
          'pjooo.tipo_estrutura_organica_sigla',


          Database.raw('upper(tpj.nome) as tipo_pessoajuridica_nome'),
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")

        )
        .innerJoin('pessoas as p', 'p.id', 'pj.id')
        .innerJoin('tipo_pessoajuridicas as tpj', 'tpj.id', 'pj.tipo_pessoajuridica_id')
        .innerJoin('pessoajuridicas as pjo', 'pjo.id', 'pj.pessoajuridica_id')
        .innerJoin('pessoas as po', 'po.id', 'pjo.id')
        .innerJoin('pessoajuridicas as pjoo', 'pjoo.id', 'pjo.pessoajuridica_id')
        .innerJoin('pessoas as poo', 'poo.id', 'pjoo.id')

        .innerJoin('pessoajuridicas as pjooo', 'pjooo.id', 'pjoo.pessoajuridica_id')
        .innerJoin('pessoas as pooo', 'pooo.id', 'pjooo.id')
        .where('p.eliminado', false)
        .whereIn('tpj.nome', ['Posto Policial'])

        .where(query => {
          if (options.seccaoId) {
            query.where('pj.pessoajuridica_id', options.seccaoId)

          }
        })
        .where(query => {
          if (options.departamentoId) {
           
            query.where('pjo.pessoajuridica_id', options.departamentoId)
          }
        })
        .where(query => {
          if (options.orgaoId) {
            query.where('pjoo.pessoajuridica_id', options.orgaoId)

          }
        })
        .where(query => {
          if (options.tipoOrgao) {
            query.where('pjooo.tipo_estrutura_organica_sigla', options.tipoOrgao)

          }
        })

        .where(query => {
          if (options.entidade) {
            query.where('tpj.nome', options.entidade)
          }
        })


        .where(function (item: any): void {

          if (options.search) {
            item.where('p.nome_completo', 'like', `%${options.search}%`)
            item.orWhere('pj.sigla', 'like', `%${options.search}%`)
            item.orWhere('po.nome_completo', 'like', `%${options.search}%`)
            item.orWhere('pjo.sigla', 'like', `%${options.search}%`)
            item.orWhere('poo.nome_completo', 'like', `%${options.search}%`)
            item.orWhere('pjoo.sigla', 'like', `%${options.search}%`)
            item.orWhere('poo0.nome_completo', 'like', `%${options.search}%`)
            item.orWhere('pjooo.sigla', 'like', `%${options.search}%`)
            item.orWhere('pj.nif', 'like', `%${options.search}%`)
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

  public async buscarNif(n: any) {
    return n ? await Database.from('pessoajuridicas').orWhere('nif', n).first() : null
  }

}
