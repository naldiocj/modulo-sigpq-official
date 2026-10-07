import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import CrudLicencaRepository from "../../../config/licencas-para-funcionario/repositories/crud-repositorio";
import CrudBasePessoaJuridicaRepository from "../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export";
import { enviarPdf } from "../pdf/pdf-response";
import { RelatorioPdf } from "../pdf/relatorio-pdf";

const removeTextNullVariable = require("App/@piips/shared/metodo-generico/RemoveTextNullVariable");

const { ok } = require("App/Helper/Http-helper");

function getMonthName(monthNumber: number): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return months[monthNumber - 1];
}

export default class Controller {
  #licenca;
  #crudPessoaJuridica: CrudBasePessoaJuridicaRepository;
  data = new Date();
  constructor() {
    this.#licenca = new CrudLicencaRepository();
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository();
  }

  public async buscarOpcoesDoSelector({}): Promise<any> {
    const opcoes = [
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
      {
        id: "nip",
        text: "NIP",
        largura: 10,
      },
      {
        id: "numero_agente",
        text: "NAS",
        largura: 10,
      },
      {
        id: "sigla",
        text: "Orgão".toUpperCase(),
        largura: 10,
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

      const valoresSelecionados = [
        "patente_nome",
        "nome_completo_apelido",
        "nip",
        "numero_agente",
        "sigla",
      ];
      const options = {
        ...input,
        user,
        orgao,
        valoresSelecionados: valoresSelecionados,
      };

      const listaFuncionarios = await this.#licenca.listarTodosComPessoas(
        options
      );
      let comandante_do_orgao =
        await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo(
          { pessoajuridica_id: options.orgao.id }
        );

      const nomeLicenca = String(input.licenca_name || "").toUpperCase();
      const ano = input.ano;
      const mes = input.mes;
      const titulo = `LICENÇA ${nomeLicenca}`;
      const subtitulo = `RELAÇÃO NOMINAL DOS EFECTIVOS EM LICENÇA ${nomeLicenca} DO ANO DE ${ano} DE ${getMonthName(
        Number(mes)
      ).toUpperCase()}.`;

      const colunas = [
        { id: "Ordem", texto: "N", largura: 4 },
        { id: "patente_nome", texto: "Patente", largura: 25 },
        { id: "nome_completo_apelido", texto: "Nome Completo", largura: 35 },
        { id: "nip", texto: "NIP", largura: 10 },
        { id: "numero_agente", texto: "NAS", largura: 10 },
        { id: "sigla", texto: "Orgão", largura: 10 },
      ];

      const linhas = listaFuncionarios.map(
        (funcionario: Record<string, any>, indice: number) => {
          const linha: Record<string, any> = {};
          valoresSelecionados.forEach((chave: string) => {
            const valor = funcionario[chave];
            linha[chave] =
              valor === undefined || valor === null || valor === ""
                ? "------------"
                : valor;
          });
          linha.Ordem = String(indice + 1);
          return linha;
        }
      );

      const relatorio = new RelatorioPdf({
        orientacao: "retrato",
        titulo,
        subtitulo,
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

      return enviarPdf(
        response,
        relatorio.doc,
        `relatorio-de-licencas-${nomeLicenca.toLowerCase()}-${ano}`
      );
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
