import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import CrudBaseMobilidadeRepository from "../../../mobilidade/repositories/crud-mobilidade-export";
import CrudBasePessoaJuridicaRepository from "../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export";
import { enviarPdf } from "../pdf/pdf-response";
import { RelatorioPdf } from "../pdf/relatorio-pdf";
import { getMarca } from "../../config/marca";

const removeTextNullVariable = require("App/@piips/shared/metodo-generico/RemoveTextNullVariable");

const { ok } = require("App/Helper/Http-helper");

export default class Controller {
  #crudMobilidade: CrudBaseMobilidadeRepository;
  #crudPessoaJuridica: CrudBasePessoaJuridicaRepository;
  data = new Date();
  constructor() {
    this.#crudMobilidade = new CrudBaseMobilidadeRepository();
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository();
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
    let result = await this.#crudMobilidade.api.listarTodos({
      numero_guia: req.numero_guia,
      user,
      orgao,
    });
    let result_efectivos = await this.#crudMobilidade.api.listar({
      numero_guia: req.numero_guia,
      user,
      orgao,
    });
    let comandante_do_orgao =
      await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo(
        { pessoajuridica_id: result[0].pessoajuridica_passado.id }
      );
    try {
      const local_Colocacao = result[0].pessoajuridica_actual.nome_completo;
      const marca = getMarca();

      const relatorio = new RelatorioPdf({
        orientacao: "retrato",
        titulo: "GUIA DE MARCHA",
        subtitulo: `N.º ${result[0].numero_guia}`,
        emitidoPor: user.nome_completo || user.username,
        registos: result_efectivos.length,
      });

      relatorio.espaco(4);

      relatorio.escreverParagrafo(
        `Faz-se constar às autoridades e a quem o conhecimento desta competir, que marcha desta Direcção para ${
          local_Colocacao.split(" ")[0][0] == "D" ? "a" : "o"
        } ${local_Colocacao}/${
          marca.sigla
        }, onde foi Transferido, ao abrigo do Despacho n.º ${
          result[0].despacho_descricao
        }, de Sua Excelência Comandante Geral/${marca.sigla} ${
          result[0].numero_ordem
            ? ",publicado na Ordem de Serviço n.º" + result[0].numero_ordem
            : ""
        }, ${
          result_efectivos.length > 1 ? "os efectivos" : "o efectivo"
        } abaixo descrito:`
      );

      relatorio.espaco(6);

      const colunasEfectivos = [
        { id: "Ordem", texto: "N", largura: 4 },
        { id: "nip", texto: "NIP", largura: 10 },
        { id: "patente_nome", texto: "Patente", largura: 16 },
        { id: "nome_completo", texto: "Nome Completo", largura: 30 },
        { id: "numero_agente", texto: "NAS", largura: 8 },
      ];

      const linhasEfectivos = result_efectivos.map(
        (efectivo: Record<string, any>, indice: number) => ({
          Ordem: String(indice + 1),
          nip: efectivo.nip ?? "------------",
          patente_nome: efectivo.patente_nome ?? "------------",
          nome_completo: efectivo.nome_completo ?? "------------",
          numero_agente: efectivo.numero_agente ?? "",
        })
      );

      relatorio.tabela(colunasEfectivos, linhasEfectivos);

      relatorio.espaco(6);

      relatorio.escreverParagrafo(
        `E para que não se lhe ponham impedimento, mandei passar a presente Guia, que vai por mim assinada e devidamente autenticada com selo branco em uso nesta Direcção.`
      );

      relatorio.espaco(8);

      relatorio.assinatura({
        cargo: comandante_do_orgao?.cargo_nome || "NÃO DEFINIDO",
        nome: comandante_do_orgao?.nome_completo,
        patente: comandante_do_orgao?.patente_nome,
      });

      relatorio.fechar();

      return enviarPdf(
        response,
        relatorio.doc,
        `guia-de-marcha-${result[0].numero_guia}`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      response.status(500).send({
        statusCode: 500,
        object: null,
        message: "Não foi possível gerar o documento. Tente novamente.",
      });
    }
  }
}
