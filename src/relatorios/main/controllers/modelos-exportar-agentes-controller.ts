import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import CrudBasePessoaJuridicaRepository from "../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export";
import { enviarPdf } from "../pdf/pdf-response";
import { RelatorioPdf } from "../pdf/relatorio-pdf";

const removeTextNullVariable = require("App/@piips/shared/metodo-generico/RemoveTextNullVariable");

const { ok } = require("App/Helper/Http-helper");

export default class Controller {
  #crudPessoaJuridica: CrudBasePessoaJuridicaRepository;
  data = new Date();
  constructor() {
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository();
  }

  public async buscarOpcoesDoSelector({}): Promise<any> {
    const opcoes = [
      {
        id: "nip",
        text: "NIP",
        largura: 10,
      },
      {
        id: "patente_nome",
        text: "Patente".toUpperCase(),
        largura: 25,
      },
      {
        id: "nome_completo_apelido",
        text: "Nome Completo".toUpperCase(),
        largura: 35,
      },
    ];

    const opcoesOrdenado = opcoes; //.sort((a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase()));

    return ok(opcoesOrdenado, null);
  }

  public async listarTodos({
    auth,
    request,
    response,
  }: HttpContextContract): Promise<any> {
    const { user, orgao }: any = auth.use("jwt").payload;

    if (!user) {
      return response.badRequest({
        message: "Utilizador não está logado",
        object: null,
      });
    }

    const req = request.all();

    try {
      const input = removeTextNullVariable(req);

      const options = {
        ...input,
        user,
        orgao,
      };

      const listaFuncionarios = JSON.parse(options.agentes);
      let comandante_do_orgao =
        await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo(
          { pessoajuridica_id: options.orgao.id }
        );

      const titulo = input.titulo || "Exportação de Agentes";
      const colunas = [
        { id: "Ordem", texto: "N", largura: 4 },
        { id: "nip", texto: "NIP", largura: 10 },
        { id: "patente_nome", texto: "Patente", largura: 25 },
        { id: "nome_completo_apelido", texto: "Nome Completo", largura: 35 },
      ];

      const linhas = listaFuncionarios.map(
        (funcionario: Record<string, any>, indice: number) => {
          const linha: Record<string, any> = {};
          ["nip", "patente_nome", "nome_completo_apelido"].forEach(
            (chave: string) => {
              const valor = funcionario[chave];
              linha[chave] =
                valor === undefined || valor === null || valor === ""
                  ? "------------"
                  : valor;
            }
          );
          linha.Ordem = String(indice + 1);
          return linha;
        }
      );

      const relatorio = new RelatorioPdf({
        orientacao: "retrato",
        titulo,
        subtitulo: "Relação nominal dos efectivos seleccionados",
        emitidoPor: user.nome_completo || user.username,
        registos: listaFuncionarios.length,
      });

      relatorio.tabela(colunas, linhas);

      relatorio.assinatura({
        cargo: comandante_do_orgao?.cargo_nome,
        nome: comandante_do_orgao?.nome_completo || user.nome_completo,
        patente: comandante_do_orgao?.patente_nome,
      });

      relatorio.fechar();

      return enviarPdf(response, relatorio.doc, "exportacao-de-agentes");
    } catch (error) {
      console.error("Error generating PDF:", error);
      return response.status(500).send({
        statusCode: 500,
        object: null,
        message: "Não foi possível gerar o relatório. Tente novamente.",
      });
    }
  }
}
