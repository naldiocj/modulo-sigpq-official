import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import EstatisticaGeralRepository from '../../repositories/estatistica-geral-repositorio';

const { ok } = require('App/Helper/Http-helper');

export default class Controller {
  #repo
  constructor() {
    this.#repo = new EstatisticaGeralRepository()
  }

  public async executeMapaEfetividadeMensal({ response,request }: HttpContextContract): Promise<any> {

    const options = {
      page: request.input("page") || null,
      perPage: request.input("perPage") || null,
      mes: request.input("mes") || null,
      orgao: request.input("orgao") || null,
      habilitacaoliteraria: request.input("habilitacaoliteraria") || null,
      patente: request.input("patente") || null,
      funcao: request.input("funcao") || null,
    }
    const result = await this.#repo.listarTodosMapaEfetividadeMensal(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }

  public async executeMapaPassividadeMensal({ response,request }: HttpContextContract): Promise<any> {

    const options = {
      page: request.input("page") || null,
      perPage: request.input("perPage") || null,
      mes: request.input("mes") || null,
      orgao: request.input("orgao") || null,
      habilitacaoliteraria: request.input("habilitacaoliteraria") || null,
      patente: request.input("patente") || null,
      funcao: request.input("funcao") || null,
    }
    const result = await this.#repo.listarTodosMapaPassividadeMensal(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }

  public async executecomposicaoEtaria({ response }: HttpContextContract): Promise<any> {


    const result = await this.#repo.listarTodosComposicaoEtaria()

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }

  public async executeDistribuicaoPorOrgao({ response,request }: HttpContextContract): Promise<any> {

    const options = {
      page: request.input("page") || null,
      perPage: request.input("perPage") || null,
      orgao: request.input("orgao") || null
    }

    const result = await this.#repo.listarTodosDistribuicaoOrgao(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }

  public async executecargoDirecaoChefia({ response,request }: HttpContextContract): Promise<any> {

    const options = {
      page: request.input("page") || null,
      perPage: request.input("perPage") || null,
      orgao: request.input("orgao") || null
    }

    const result = await this.#repo.listar_Cargos_Direcao_Chefia(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }

  public async executeFormacaoAcademica({ response,request }: HttpContextContract): Promise<any> {

    const options = {
      page: request.input("page") || null,
      perPage: request.input("perPage") || null,
      orgao: request.input("orgao") || null
    }

    const result = await this.#repo.listar_Formacao_Academica(options)

    if (result instanceof Error) {
      return response.badRequest({
        message: result.message,
        object: null,
      });
    }
    return ok(result, null);

  }

}
