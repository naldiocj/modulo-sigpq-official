import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import CrudLicencaRepository from "../../../config/licencas-para-funcionario/repositories/crud-repositorio";
import CrudBasePessoaJuridicaRepository from "../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export";
import CrudBaseTipoLicencaRepository from "../../../config/tipo-licenca/repositories/crud-tipoLicenca-export";
import CrudBaseFuncionarioRepository from "../../../funcionario/repositories/crud-funcionario-export";
import { enviarPdf } from "../pdf/pdf-response";
import { RelatorioPdf } from "../pdf/relatorio-pdf";
import { getMarca } from "../../config/marca";

const removeTextNullVariable = require("App/@piips/shared/metodo-generico/RemoveTextNullVariable");

const { ok } = require("App/Helper/Http-helper");

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

      let comandante_do_orgao =
        await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo(
          { pessoajuridica_id: input.pessoajuridica_id }
        );
      let pessoa_fisica = await this.#crudPessoaFisica.api.listarUm(
        input.pessoafisica_id
      );
      let tipoLicenca = await this.#tipoLicenca.api.listarTodos({
        tipo_licenca: input.tipo_licenca_id,
      });

      let filtro;
      if (!input.licenca_disciplinar)
        filtro = {
          tipo_licenca_id: input.tipo_licenca_id,
          pessoafisica_id: input.pessoafisica_id,
          ano: input.ano,
          mes: input.mes,
        };
      else
        filtro = {
          tipo_licenca_id: input.tipo_licenca_id,
          pessoafisica_id: input.pessoafisica_id,
          ano: input.ano,
        };
      let licencas = await this.#licenca.saberDiasDeFerias(filtro);
      const licenca = tipoLicenca[0].nome;
      const quantidade_Dias = licencas.length;
      const temDireitoAMaisDiasPeloSeuServico: boolean =
        licenca == "DISCIPLINAR" && quantidade_Dias > 22;

      const local_Colocacao = `${pessoa_fisica.sigpq_tipo_orgao.nome_completo}`;
      const nome = `${pessoa_fisica.patente_nome} - ${pessoa_fisica.nome_completo}`;
      const orgaoSigla = `${pessoa_fisica.sigpq_tipo_orgao.sigla}`;

      const relatorio = new RelatorioPdf({
        orientacao: "paisagem",
        titulo: `LICENÇA ${licenca}`,
        emitidoPor: user.nome_completo || user.username,
        registos: quantidade_Dias,
      });

      if (licencas.length == 0) {
        relatorio.espaco(6);
        relatorio.escreverParagrafo(
          `De momento não há dia aprovado para gerar o documento`,
          { centralizado: true, tamanho: 13 }
        );
        relatorio.fechar();
        return enviarPdf(
          response,
          relatorio.doc,
          `licenca-${String(licenca).toLowerCase()}-sem-dias`
        );
      }

      const dia_retorno = await this.formatDateToExtenso(
        licencas[quantidade_Dias - 1].dia_selecionado
      );
      const dia_inicio = await this.formatDateToExtenso(
        licencas[0].dia_selecionado
      );

      relatorio.espaco(6);

      if (temDireitoAMaisDiasPeloSeuServico) {
        relatorio.escreverParagrafo(
          `Tem direito a ${Math.min(
            quantidade_Dias,
            22
          )} dias úteis, com início no dia ${dia_inicio}, o ${nome} afecto à este Órgão, a qual lhe foi concedido gozar em território nacional.`,
          { tamanho: 11 }
        );

        const dias = quantidade_Dias - 22;
        const plural = dias > 1 ? "dias úteis" : "dia útil";
        const verbo =
          dias > 1 ? "Nota: Foram acrescidos" : "Nota: Foi acrescido";

        relatorio.escreverParagrafo(
          `${verbo} ${this.numeroPorExtenso(dias)} ${plural}, pelos ${
            (await this.calcularTempoDeServico(pessoa_fisica.data_adesao)) ??
            "S/D"
          } anos de serviço efectivos, prestados desde ${
            pessoa_fisica.data_adesao.split("/")[2] ?? "S/D"
          }, nos termos do n.º 2 do artigo 79.º de Decreto-Lei 26/22 de 22 de Agosto. Devendo apresentar-se às 8 horas do dia ${dia_retorno}.`,
          { tamanho: 11 }
        );
      } else {
        relatorio.escreverParagrafo(
          `Tem direito a ${quantidade_Dias} dias úteis, com início no dia ${dia_inicio}, o ${nome} afecto à este Órgão, a qual lhe foi concedido gozar em território nacional, devendo apresentar-se às 8 horas do dia ${dia_retorno}.`,
          { tamanho: 11 }
        );
      }

      relatorio.espaco(4);

      relatorio.escreverParagrafo(
        `Obs: Deve comparecer nos Tribunais e Órgão de Justiça, sempre que for ${
          pessoa_fisica.genero == "M"
            ? "intimado ou requisitado"
            : "intimada ou requisitada"
        }.`,
        { tamanho: 11 }
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
        `licenca-${String(licenca)
          .toLowerCase()
          .replace(/\s+/g, "-")}-${orgaoSigla}-${nome.split(" ")[0]}`
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

  numeroPorExtenso(numero: number): string {
    const numerosExtenso: Record<number, string> = {
      1: "um",
      2: "dois",
      3: "três",
      4: "quatro",
      5: "cinco",
      6: "seis",
      7: "sete",
      8: "oito",
      9: "nove",
      10: "dez",
      11: "onze",
      12: "doze",
      13: "treze",
      14: "catorze",
      15: "quinze",
      16: "dezasseis",
      17: "dezassete",
      18: "dezoito",
      19: "dezanove",
      20: "vinte",
      21: "vinte e um",
      22: "vinte e dois",
      23: "vinte e três",
      24: "vinte e quatro",
      25: "vinte e cinco",
      26: "vinte e seis",
      27: "vinte e sete",
      28: "vinte e oito",
      29: "vinte e nove",
      30: "trinta",
    };

    if (numero >= 1 && numero <= 30) {
      return numerosExtenso[numero];
    }
    return "Número fora do intervalo (1-30)";
  }

  async calcularTempoDeServico(dataAdesao: string): Promise<string> {
    const [dia, mes, ano] = dataAdesao.split("/").map(Number);

    const dataInicio = new Date(ano, mes - 1, dia);
    const dataAtual = new Date();

    if (isNaN(dataInicio.getTime())) {
      return "Data de adesão inválida.";
    }

    let anos = dataAtual.getFullYear() - dataInicio.getFullYear();
    let meses = dataAtual.getMonth() - dataInicio.getMonth();
    let dias = dataAtual.getDate() - dataInicio.getDate();

    if (dias < 0) {
      meses--;
      const ultimoDiaDoMesAnterior = new Date(
        dataAtual.getFullYear(),
        dataAtual.getMonth(),
        0
      ).getDate();
      dias += ultimoDiaDoMesAnterior;
    }

    if (meses < 0) {
      anos--;
      meses += 12;
    }

    return this.numeroPorExtenso(anos);
  }

  async formatDateToExtenso(dateString: string): Promise<string> {
    const date = new Date(dateString);

    const meses = [
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

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = meses[date.getMonth()];
    const ano = date.getFullYear();

    return `${dia} de ${mes} de ${ano}`;
  }
}
