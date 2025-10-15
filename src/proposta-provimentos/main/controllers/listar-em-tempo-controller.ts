import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import ListarEmTempoRepositorio from '../../repositories/listar-em-tempo-repositorio'

const { ok } = require('App/Helper/Http-helper');


export default class ListarEmTempoController {
  #repo

  constructor() {
    this.#repo = new ListarEmTempoRepositorio()
  }

  public async execute({ auth, request, response }: HttpContextContract): Promise<any> {

    const { user, orgao }: any = auth.use('jwt').payload

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }

    const options = {
      page: await this.validarNullOuUndefined(request, "page"),
      perPage: await this.validarNullOuUndefined(request, "perPage"),
      search: await this.validarNullOuUndefined(request, "search"),
      modulo_slug: await this.validarNullOuUndefined(request, "modulo"),
      regime: await this.validarNullOuUndefined(request, "regime"),
      orderByAscOrDesc: request.input("orderByAscOrDesc") || 'asc',
      user, orgao,
      mais_ano: await this.validarNullOuUndefined(request, 'mais_ano'),
      mes_ano: await this.validarNullOuUndefined(request, 'menos_ano'),
      listarTodos: await this.validarNullOuUndefined(request, 'listarTodos'),
      regimeId: await this.validarNullOuUndefined(request, 'regimeId'),
      patenteId: await this.validarNullOuUndefined(request, 'patenteId'),
      patenteClasse: await this.validarNullOuUndefined(request, 'patenteClasse'),
      sigpq_acto_progressao_id: await this.validarNullOuUndefined(request, 'sigpq_acto_progressao_id'),
      tipoVinculoId: await this.validarNullOuUndefined(request, 'tipoVinculoId'),
      tipoOrgaoId: await this.validarNullOuUndefined(request, 'tipoOrgaoId'),
      orgaoId: await this.validarNullOuUndefined(request, 'orgaoId'),
      genero: await this.validarNullOuUndefined(request, 'genero'),
      semTempo: await this.validarNullOuUndefined(request, 'semTempo'),
      emTempo: await this.validarNullOuUndefined(request, 'emTempo'),
      idadeMais: await this.validarNullOuUndefined(request, 'idadeMais'),
      idadeMenos: await this.validarNullOuUndefined(request, 'idadeMenos'),
      anoMais: await this.validarNullOuUndefined(request, 'anoMais'),
      anoMenos: await this.validarNullOuUndefined(request, 'anoMenos'),
      numero: await this.validarNullOuUndefined(request, 'numero'),
      pessoaId: await this.validarNullOuUndefined(request, 'pessoaId')
    }


    const result = await this.#repo.listarTodos(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }

    return ok(result, null);

  }

  async validarNullOuUndefined(request: any, field: any) {
    return ['null', '0', undefined].includes(request.input(field)) ? null : request.input(field);
  }
}
