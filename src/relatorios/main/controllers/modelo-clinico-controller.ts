import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import CrudLicencaRepository from "../../../config/licencas-para-funcionario/repositories/crud-repositorio";
import CrudBasePessoaJuridicaRepository from "../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export";
import CrudBaseTipoLicencaRepository from "../../../config/tipo-licenca/repositories/crud-tipoLicenca-export";
import CrudBaseFuncionarioRepository from "../../../funcionario/repositories/crud-funcionario-export";
import { enviarPdf } from "../pdf/pdf-response";
import { RelatorioPdf } from "../pdf/relatorio-pdf";
import { getMarca } from "../../config/marca";

const removeTextNullVariable = require("App/@piips/shared/metodo-generico/RemoveTextNullVariable");

function formatarDoisDigitos(x: number): string {
  return x > 9 ? x.toString() : `0${x}`;
}

export default class Controller {
  #licenca;
  #crudPessoaJuridica: CrudBasePessoaJuridicaRepository;
  #crudPessoaFisica: CrudBaseFuncionarioRepository;
  #tipoLicenca;
  data = new Date();
  constructor() {
    this.#licenca = new CrudLicencaRepository();
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository();
    this.#crudPessoaFisica = new CrudBaseFuncionarioRepository();
    this.#tipoLicenca = new CrudBaseTipoLicencaRepository();
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

      const nome = `${pessoa_fisica.nome_completo} ${
        pessoa_fisica.apelido ?? ""
      }`;
      const orgaoSigla = `${pessoa_fisica.sigpq_tipo_orgao.sigla}`;

      const relatorio = new RelatorioPdf({
        orientacao: "retrato",
        titulo: "GUIA MÉDICA",
        subtitulo: `CENTRO MÉDICO PRINCIPAL DO ${getMarca().nome.toUpperCase()}`,
        emitidoPor: user.nome_completo || user.username,
        registos: 0,
      });

      relatorio.espaco(4);

      relatorio.escreverParagrafo(`NOME: ${nome}`, { tamanho: 11 });
      relatorio.escreverParagrafo(
        `VÍNCULO JURÍDICO LABORAL: ${pessoa_fisica.patente_nome}`,
        { tamanho: 11 }
      );
      relatorio.escreverParagrafo(`COLOCAÇÃO: ${funcao} nesta Direcção`, {
        tamanho: 11,
      });
      relatorio.escreverParagrafo(
        "SITUAÇÃO: Por manifestar sintomas de doença.",
        { tamanho: 11 }
      );

      relatorio.espaco(8);

      const data = new Date();
      relatorio.escreverParagrafo(
        `Luanda, aos ${formatarDoisDigitos(
          data.getDate()
        )}/${formatarDoisDigitos(data.getMonth() + 1)}/${data.getFullYear()}.`,
        { tamanho: 11 }
      );

      relatorio.assinatura({
        cargo: comandante_do_orgao?.cargo_nome || "NÃO DEFINIDO",
        nome: comandante_do_orgao?.nome_completo,
        patente: comandante_do_orgao?.patente_nome,
      });

      relatorio.espaco(2);
      relatorio.escreverParagrafo("EXAME CLÍNICO", {
        centralizado: true,
        negrito: true,
        tamanho: 11,
      });
      relatorio.espaco(2);
      relatorio.linhasGuia(3);

      relatorio.espaco(4);
      relatorio.escreverParagrafo("O MÉDICO", {
        centralizado: true,
        negrito: true,
        tamanho: 11,
      });
      relatorio.espaco(2);
      relatorio.linhasGuia(2);

      relatorio.fechar();

      return enviarPdf(
        response,
        relatorio.doc,
        `guia-medica-${pessoa_fisica.nome_completo.split(" ")[0]}-${orgaoSigla}`
      );
    } catch (error) {
      console.error("Error generating doc:", error);
      response.status(500).send({
        statusCode: 500,
        object: null,
        message: "Não foi possível gerar o documento. Tente novamente.",
      });
    }
  }
}
