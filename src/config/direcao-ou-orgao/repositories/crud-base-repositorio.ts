import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';

export default class CrudBaseRepository {
  public async registar(input: any): Promise<any> {

    const dateTime = new Date()

    if (!input.nome_completo) {
      return Error('O campo Nome é obrigatório.')
    }

    if (!input.sigla) {
      return Error('O campo Sigla é obrigatório.')
    }

    if (!input.tipo_estrutura_sigla) {
      return Error('O campo estrutura orgânica é obrigatório.')
    }

    if (!input.user_id) {
      return Error('Utilizador não está logado')
    }

    if (await this.buscarSigla(input.sigla)) {
      return Error('A sigla já existe')
    }

    const trx = await Database.transaction()

    try {

      const pessoa = {
        nome_completo: input.nome_completo,
        tipo: 'pj',
        email_pessoal: input.email_pessoal,
        activo: input.activo ? 1 : 0,
        user_id: input.user_id,
        created_at: dateTime,
        updated_at: dateTime
      }

      const pessoaId = await Database
        .table('pessoas')
        .useTransaction(trx)
        .insert(pessoa)

      if (input.contacto) {

        const contacto = {
          contacto: input.contacto,
          pessoa_id: pessoaId,
          sigpq_tipo_contacto_id: 1,
          user_id: input.user_id,
          descricao: 'Telefone',
          created_at: dateTime,
          updated_at: dateTime
        }

        await Database
          .insertQuery()
          .table('sigpq_contactos')
          .useTransaction(trx)
          .insert(contacto)
      }


      if (input.endereco) {
        const residenciaActual = {
          residencia_actual: input.endereco,
          pessoa_id: pessoaId,
          user_id: input.user_id,
          created_at: dateTime,
          updated_at: dateTime
        }


        await Database
          .insertQuery()
          .table('sigpq_enderecos')
          .useTransaction(trx)
          .insert(residenciaActual)
      }



      const pessoaJuridica = {
        id: pessoaId,
        sigla: input.sigla,
        pessoajuridica_id: null,
        tipo_pessoajuridica_id: 1,
        activo: input.activo,
        descricao: input.descricao,
        tipo_estrutura_organica_sigla: input.tipo_estrutura_sigla,
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

    if (!input.sigla) {
      return Error('O campo Sigla é obrigatório.')
    }

    if (!input.tipo_estrutura_sigla) {
      return Error('O campo estrutura orgânica é obrigatório.')
    }

    if (!input.user_id) {
      return Error('Utilizador não está logado')
    }

    if (await this.buscarSiglaDiff(id, input.sigla)) {
      return Error('A sigla já existe')
    }

    const trx = await Database.transaction()

    try {

      const pessoa = {
        nome_completo: input.nome_completo,
        tipo: 'pj',
        email_pessoal: input.email_pessoal,
        activo: input.activo ? 1 : 0,
        user_id: input.user_id,
        updated_at: dateTime
      }

      await Database.from('pessoas').where('id', id).update(pessoa).useTransaction(trx)


      if (input.contacto) {

        const cont = await Database.from('sigpq_contactos')
          .where('pessoa_id', id)
          .where('sigpq_tipo_contacto_id', 1)
          .where('activo', true)
          .where('descricao', 'Telefone')
          .where('eliminado', false)
          .first()

        if (cont) {
          const contacto = {
            contacto: input.contacto,
            user_id: input.user_id,
            descricao: 'Telefone',
            updated_at: dateTime

          }

          await Database
            .from('sigpq_contactos')
            .useTransaction(trx)
            .where('pessoa_id', id)
            .where('sigpq_tipo_contacto_id', 1)
            .where('descricao', 'Telefone')
            .where('activo', true)
            .where('eliminado', false)
            .update(contacto)
        } else {
          const contacto = {
            contacto: input.contacto,
            pessoa_id: id,
            sigpq_tipo_contacto_id: 1,
            user_id: input.user_id,
            descricao: 'Telefone',
            created_at: dateTime,
            updated_at: dateTime
          }

          await Database
            .insertQuery()
            .table('sigpq_contactos')
            .useTransaction(trx)
            .insert(contacto)

        }

      }

      if (input.endereco) {

        const c = await Database.from('sigpq_enderecos')
          .where('pessoa_id', id)
          .where('activo', true)
          .where('eliminado', false)
          .first()

        const enderecoActual = {
          residencia_actual: input.endereco,
          user_id: input.user_id,
          updated_at: dateTime
        }

        if (c) {
          await Database
            .from('sigpq_enderecos')
            .useTransaction(trx)
            .where('pessoa_id', id)
            .where('activo', true)
            .where('eliminado', false)
            .update(enderecoActual)
        } else {

          await Database
            .insertQuery()
            .table('sigpq_enderecos')
            .useTransaction(trx)
            .insert({
              ...enderecoActual,
              pessoa_id: id,
              created_at: dateTime
            })
        }
      }




      const pessoaJuridica = {
        id: id,
        sigla: input.sigla,
        pessoajuridica_id: null,
        tipo_pessoajuridica_id: 1,
        activo: input.activo,
        descricao: input.descricao,
        tipo_estrutura_organica_sigla: input.tipo_estrutura_sigla,
        updated_at: dateTime,
      }

      await Database.from('pessoajuridicas').where('id', id).update(pessoaJuridica).useTransaction(trx)

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
          Database.raw("upper(p.nome_completo) as nome_completo"),
          // 'p.nome_completo',
          'p.email_pessoal',
          'cts.contacto',
          'end.residencia_actual as endereco',
          'p.user_id',
          'p.activo',
          'pj.sigla',
          'pj.descricao',
          'pj.orgao_comando_provincial',
          'pj.tipo_estrutura_organica_sigla',
          Database.raw('upper(tpj.nome) as tipo_pessoajuridica_nome'),
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")

        )
        .innerJoin('pessoas as p', 'p.id', 'pj.id')
        .innerJoin('tipo_pessoajuridicas as tpj', 'tpj.id', 'pj.tipo_pessoajuridica_id')
        .leftJoin('sigpq_contactos as cts', 'cts.pessoa_id', 'p.id')
        .leftJoin('sigpq_enderecos as end', 'end.pessoa_id', 'p.id')
        .where('p.eliminado', false)
        .where('pj.eliminado', false)
        .orderBy('p.nome_completo')
        .where(query => {
          if (options.pessoafisica) {
            query.where('pj.pessoajuridica_id', options.pessoafisica)
            // query.whereIn('tpj.nome', ['Departamento', 'Comando Municipal', 'Unidade'])
            query.whereIn('tpj.nome', ['Departamento', 'Comando Municipal', 'Unidade', 'Secção', 'Esquadra', 'Subunidade'])
          } else if (options.pessoajuridica_id) {
            query.where('pj.id', options.pessoajuridica_id)
          } else {
            query.where('tpj.nome', 'Direção ou Orgão')
          }
        })


        .where(function (item: any): void {
          if (options.search) {
            item.where('p.nome_completo', 'like', `%${options.search}%`)
            item.orWhere('pj.sigla', 'like', `%${options.search}%`)
            item.orWhere('tpj.nome', 'like', `%${options.search}%`)
            item.orWhere('p.email_pessoal', 'like', `%${options.search}%`)
            item.orWhere('cts.contacto', 'like', `%${options.search}%`)
            item.orWhere('end.residencia_actual', 'like', `%${options.search}%`)
          }
        }).clone()



      if (options.minha_pessoajuridica_id) {
        query.where('pj.id', '<>', options.minha_pessoajuridica_id)
      }
      if (options.tipo_orgao) {
        query.where('pj.orgao_comando_provincial', options.tipo_orgao)
      }
      if (options.tipo_estrutura_sigla) {
        query.where('pj.tipo_estrutura_organica_sigla', options.tipo_estrutura_sigla)
      }

      if (options.pessoajuridica_id) {
        return await query.first();
      }

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query


    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async listarUm(id: any): Promise<any> {

    try {

      let query: any = Database.from({ pj: 'pessoajuridicas' })
        .select(
          'p.id',
          Database.raw("upper(p.nome_completo) as nome_completo"),
          'p.email_pessoal',
          'cts.contacto',
          'end.residencia_actual as endereco',
          'p.user_id',
          'p.activo',
          'pj.sigla',
          'pj.descricao',
          'tpj.nome as tipo_pessoajuridica_nome',
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")

        )
        .innerJoin('pessoas as p', 'p.id', 'pj.id')
        .leftJoin('sigpq_contactos as cts', 'cts.pessoa_id', 'p.id')
        .leftJoin('sigpq_enderecos as end', 'end.pessoa_id', 'p.id')
        .innerJoin('tipo_pessoajuridicas as tpj', 'tpj.id', 'pj.tipo_pessoajuridica_id')
        .where('p.eliminado', false)
        .where('pj.id', id)
        .first()

      return await query


    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }




  public async listarPorPessoa(pessoa_id: any): Promise<any> {
    try {

      let query = await Database.from({ o: 'sigpq_funcionario_orgaos' })
        .select(
          'p.id',
          Database.raw("upper(p.nome_completo) as nome"),
          Database.raw("upper(pd.nome_completo) as nome_passado"),
          'p.user_id',
          'p.activo',
          'pj.sigla',
          'pdf.sigla as sigla_passado',
          'pj.descricao',
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'o.pessoajuridica_id')
        .innerJoin('pessoas as p', 'p.id', 'pj.id')
        .leftJoin('pessoas as pd', 'pd.id', 'o.pessoajuridica_passado_id')
        .leftJoin('pessoajuridicas as pdf', 'pdf.id', 'pd.id')
        // .innerJoin('sigpq_funcionario_orgaos as o', 'o.pessoajuridica_id', 'p.id')
        .where('p.eliminado', false)
        .where('pj.tipo_pessoajuridica_id', 1)
        .where('o.pessoafisica_id', pessoa_id)
        .where('o.eliminado', false)
        .where('o.activo', true)

        .first();

      return query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }
  }
  // public async listarPorPessoa(pessoa_id: any): Promise<any> {

  //   try {

  //     let query = Database.from({ pj: 'pessoajuridicas' })
  //       .select(
  //         'p.id',
  //         'p.nome_completo as nome',
  //         'p.user_id',
  //         'p.activo',
  //         'pj.sigla',
  //         'pj.descricao',
  //         Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
  //         Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
  //       )
  //       .innerJoin('pessoas as p', 'p.id', 'pj.id')
  //       .innerJoin('sigpq_funcionario_orgaos as o', 'o.pessoajuridica_id', 'p.id')
  //       .where('p.eliminado', false)
  //       .where('pj.tipo_pessoajuridica_id', 1)
  //       .where('o.pessoafisica_id', pessoa_id)
  //       .where('o.eliminado', false)
  //       .where('o.activo', true)

  //       .first();

  //     return await query

  //   } catch (e) {
  //     console.log(e);
  //     return Error('Não foi possível listar os registos.');
  //   }

  // }

  public async buscarSigla(n: any) {
    return n ? await Database.from('pessoajuridicas').where('sigla', n).first() : null
  }
  public async buscarSiglaDiff(id: any, n: any) {
    return n ? await Database.from('pessoajuridicas').where('sigla', n).where('id', '<>', id).first() : null
  }


}
