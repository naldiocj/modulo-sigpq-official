import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import AgenteRepository from "../../repositories/agentes-repositorio";

const removeTextNullVariable = require("App/@piips/shared/metodo-generico/RemoveTextNullVariable");

const { ok } = require("App/Helper/Http-helper");

import { enviarPdf } from "../pdf/pdf-response";
import { RelatorioPdf } from "../pdf/relatorio-pdf";

/** Filtros do relatório aceites na query e apresentados na faixa de metadados. */
const FILTROS_ACEITES = [
  "regime",
  "genero",
  "sexo",
  "departamento",
  "seccao",
  "posto",
  "estado_civil",
  "tipo_efectividade",
];

function construirFiltros(
  input: Record<string, any>
): { rotulo: string; valor: string }[] {
  return FILTROS_ACEITES.filter((chave) => {
    const valor = input?.[chave];
    return valor !== undefined && valor !== null && String(valor).trim() !== "";
  }).map((chave) => ({
    rotulo: chave.charAt(0).toUpperCase() + chave.slice(1).replace(/_/g, " "),
    valor: String(input[chave]),
  }));
}

export default class Controller {
  #agente;
  data = new Date();
  constructor() {
    this.#agente = new AgenteRepository();
  }

  tiposCabecalho() {
    return [
      {
        id: "patente_nome",
        text: "Patente",
        largura: 15,
      },
      {
        id: "nome_completo_apelido",
        text: "Nome Completo",
        largura: 28,
      },
      {
        id: "nip",
        text: "NIP",
        largura: 8,
      },
      {
        id: "numero_agente",
        text: "NAS",
        largura: 8,
      },
      {
        id: "data_nascimento",
        text: "Nascimento",
        largura: 10,
      },
      {
        id: "data_adesao",
        text: "Ingresso",
        largura: 16,
      },
    ];
  }

  public async buscarOpcoesDoSelector({}): Promise<any> {
    const opcoes = this.tiposCabecalho();

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
      const numeroOrdem = { id: "Ordem", text: "#", largura: 5 };

      const options = {
        ...input,
        user,
        orgao,
        valoresSelecionados: input.valoresSelecionados, //.filter(item => item !== 'ordem')
      };

      const agentes = await this.#agente.listarTodos(options);

      const tituloRelatorio =
        (input.titulo && String(input.titulo).trim()) ||
        `Relatório de ${this.data.getFullYear()}`;

      // Sem selecção explícita, assume todas as colunas disponíveis.
      const selecionadas = Array.isArray(options.valoresSelecionados)
        ? options.valoresSelecionados
        : this.tiposCabecalho().map((item: any) => item.id);

      const colunasSelecionadas = this.tiposCabecalho()
        .filter((item: any) => selecionadas.includes(item.id))
        .map((item: any) => ({
          id: item.id,
          texto: item.text,
          largura: item.largura,
        }));
      colunasSelecionadas.unshift({
        id: numeroOrdem.id,
        texto: numeroOrdem.text,
        largura: numeroOrdem.largura,
      });

      const linhas = agentes.map(
        (agente: Record<string, any>, indice: number) => {
          const linha: Record<string, any> = { Ordem: String(indice + 1) };
          selecionadas.forEach((chave: string) => {
            if (agente.hasOwnProperty(chave)) {
              linha[chave] = [null, "null"].includes(agente[chave])
                ? "------------"
                : agente[chave];
            }
          });
          return linha;
        }
      );

      const relatorio = new RelatorioPdf({
        orientacao: "paisagem",
        titulo: tituloRelatorio,
        subtitulo: "Relação nominal de agentes",
        emitidoPor: user.nome_completo || user.username,
        registos: agentes.length,
        filtros: construirFiltros(input),
      });

      relatorio.tabela(colunasSelecionadas, linhas);
      relatorio.fechar();

      return enviarPdf(
        response,
        relatorio.doc,
        `${tituloRelatorio}-${new Date().getFullYear()}`
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
