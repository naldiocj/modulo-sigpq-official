import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { jsPDF } from "jspdf";
import { logoInsignia, logoInsigniaMarcaDeAgua, logoRodaPe } from '../../../../../../app/@piips/shared/metodo-generico/helpers';
import CrudBasePessoaJuridicaRepository from '../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export';
import CrudBaseFuncionarioRepository from '../../../funcionario/repositories/crud-funcionario-export';
import { adicionarParteInferior, adicionarParteSuperior, adicionarRodape, escreverTextoComNegrito, escreverTextoJustificado, escreverTextoJustificado_v2, retorno_da_pagina } from './partes-de-documento';
const fs = require('fs');

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper')

export default class Controller {
  base64Image_rodape:any
  #crudPessoaJuridica:CrudBasePessoaJuridicaRepository;
  #crudPessoaFisica:CrudBaseFuncionarioRepository;
  data = new Date()
  constructor() {
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository()
    this.#crudPessoaFisica = new CrudBaseFuncionarioRepository()
  }


  public async listarTodos({ auth, request, response }: HttpContextContract): Promise<any> {
    const { user, orgao }: any = auth.use('jwt').payload

    if (!user) {
      return response.badRequest({
        message: 'Utilizador não está logado',
        object: null,
      });
    }


    const req = request.all()

    try {
      const input = removeTextNullVariable(req)

      const options = {
        ...input,
        user,
        orgao
      }

      let pessoa_fisica = await this.#crudPessoaFisica.api.listarUm(input.pessoafisica_id)
      let comandante_do_orgao = await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo({pessoajuridica_id:pessoa_fisica.sigpq_orgao.pessoajuridica_id})
      let funcao=pessoa_fisica.sigpq_funcao?.nome??'sem função'
      let doc = new jsPDF({
        orientation: "portrait",
        format: "a4" // Largura de 210 mm e altura de 170 mm  A5 tem 210 mm de largura e 148 mm de altura
    });

    const pageWidth = doc.internal.pageSize.getWidth();


      const local_Colocacao=`${pessoa_fisica.sigpq_tipo_orgao.nome_completo}`
      const direccao=`${local_Colocacao}`
      const nome=`${pessoa_fisica.patente_nome}- ${pessoa_fisica.nome_completo} ${pessoa_fisica.apelido??''}`
      const orgaoSigla=`${pessoa_fisica.sigpq_tipo_orgao.sigla}`
      const data=new Date()


  // Dimensões da imagem (em mm)


        const textDirecao = local_Colocacao.toUpperCase();
        adicionarParteSuperior(doc,textDirecao)

        doc.setFont("helvetica", "normal");
      doc.setFontSize(14);







  // Dimensões da imagem (em mm)
      const imgWidth = 130.6; // Largura da imagem
      const imgHeight = 120.2; // Altura da imagem

      // Posição centralizada
      const xImg = (pageWidth - imgWidth) / 2; // Centro horizontal
      const yImg = 70; // Margem superior (ajustável)
        doc.addImage(logoInsigniaMarcaDeAgua, "PNG", xImg, yImg, imgWidth, imgHeight, undefined, 'FAST');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);

        doc.text(`DECLARAÇÃO ${options.efeito=='efectividade'?'DE SERVIÇO':''}`, pageWidth / 2, 80, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);

      const text = `
      Para ${options.efeito=='efectividade'?'os devidos efeitos':options.efeito}, declara-se que o ${nome}, é efectivo do quadro de
      pessoal da Polícia Nacional de Angola, exercendo a função de ${funcao}.

      `;

      const margin = 10;
      const maxWidth = pageWidth - 2 * margin; // Largura disponível no PDF
      await escreverTextoJustificado_v2(doc,text,95,maxWidth,false,8,5,5)
      //await escreverTextoComNegrito(doc,text,95,maxWidth,'',true,5)

      let _text_comparecer = `Por ser verdade e me ter sido solicitado, mandei passar a presente
        declaração que vai por mim assinada e devidamente autenticada com
        selo branco, em uso nesta Direcção.`;
       await escreverTextoJustificado_v2(doc,_text_comparecer,130,maxWidth,false,8,5,5)

       doc.setFontSize(13)
      await adicionarParteInferior(doc,local_Colocacao,maxWidth,comandante_do_orgao,170,
        {
          nome_completo:pessoa_fisica.nome_completo,
          patente_nome:pessoa_fisica.patente_nome,
          colocacao:orgaoSigla,
          nome_do_documento:`DECLARAÇÃO PARA ${options.efeito=='efectividade'?'EFECTIVIDADE':options.efeito.toUpperCase()}`
        },165
      )
      return retorno_da_pagina(doc,response)

    } catch (error) {
      console.error('Error generating PDF:', error)
      response.status(500).send('Error generating PDF')
    }

  }







async formatDateToExtenso(dateString: string): Promise<string> {
  // Cria um objeto Date a partir da string
  const date = new Date(dateString);

  // Array com os nomes dos meses
  const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Obtém o dia, mês e ano
  const dia = String(date.getDate()).padStart(2, '0'); // Formata o dia para ter 2 dígitos
  const mes = meses[date.getMonth()]; // Obtém o nome do mês
  const ano = date.getFullYear(); // Obtém o ano

  // Retorna a data formatada por extenso
  return `${dia} de ${mes} de ${ano}`;
}



}
