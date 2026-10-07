import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import CrudBasePessoaJuridicaRepository from "../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export";
import CrudBaseFuncionarioRepository from "../../../funcionario/repositories/crud-funcionario-export";
import { enviarPdf } from "../pdf/pdf-response";
import { RelatorioPdf } from "../pdf/relatorio-pdf";
import { getMarca } from "../../config/marca";

const removeTextNullVariable = require("App/@piips/shared/metodo-generico/RemoveTextNullVariable");

export default class Controller {
  #crudPessoaJuridica: CrudBasePessoaJuridicaRepository;
  #crudPessoaFisica: CrudBaseFuncionarioRepository;
  data = new Date();
  constructor() {
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository();
    this.#crudPessoaFisica = new CrudBaseFuncionarioRepository();
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

      let pessoa_fisica = await this.#crudPessoaFisica.api.listarUm(
        input.pessoafisica_id
      );
      let comandante_do_orgao =
        await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo(
          { pessoajuridica_id: pessoa_fisica.sigpq_orgao.pessoajuridica_id }
        );
      let funcao = pessoa_fisica.sigpq_funcao?.nome ?? "sem função";

      const nome = `${pessoa_fisica.patente_nome}- ${
        pessoa_fisica.nome_completo
      } ${pessoa_fisica.apelido ?? ""}`;
      const local_Colocacao = `${pessoa_fisica.sigpq_tipo_orgao.nome_completo}`;
      const orgaoSigla = `${pessoa_fisica.sigpq_tipo_orgao.sigla}`;

      const titulo = `DECLARAÇÃO ${
        options.efeito == "efectividade"
          ? "DE SERVIÇO"
          : String(options.efeito || "").toUpperCase()
      }`;

      const relatorio = new RelatorioPdf({
        orientacao: "retrato",
        titulo: titulo.trim(),
        emitidoPor: user.nome_completo || user.username,
        registos: 0,
      });

      relatorio.espaco(4);

      relatorio.escreverParagrafo(
        `Para ${
          options.efeito == "efectividade"
            ? "os devidos efeitos"
            : options.efeito
        }, declara-se que o ${nome}, é efectivo do quadro de pessoal do ${
          getMarca().nome
        }, exercendo a função de ${funcao}.`
      );

      relatorio.espaco(6);

      relatorio.escreverParagrafo(
        `Por ser verdade e me ter sido solicitado, mandei passar a presente declaração que vai por mim assinada e devidamente autenticada com selo branco, em uso nesta Direcção.`
      );

      relatorio.espaco(8);

      relatorio.assinatura({
        cargo: comandante_do_orgao?.cargo_nome || "NÃO DEFINIDO",
        nome: comandante_do_orgao?.nome_completo || pessoa_fisica.nome_completo,
        patente:
          comandante_do_orgao?.patente_nome || pessoa_fisica.patente_nome,
      });

      relatorio.fechar();

      return enviarPdf(
        response,
        relatorio.doc,
        `declaracao-${
          options.efeito == "efectividade"
            ? "de-servico"
            : String(options.efeito || "").toLowerCase()
        }-${pessoa_fisica.nome_completo.split(" ")[0]}-${orgaoSigla}`
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
