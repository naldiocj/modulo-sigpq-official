import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { jsPDF } from "jspdf";
import { logoRodaPe } from '../../../../../../app/@piips/shared/metodo-generico/helpers';
import CrudBaseMobilidadeRepository from '../../../mobilidade/repositories/crud-mobilidade-export';
import CrudBasePessoaJuridicaRepository from '../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export';
import { adicionarParteInferior, adicionarParteSuperior, retorno_da_pagina } from './partes-de-documento';
const fs = require('fs');

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper')

export default class Controller {
  base64Image_rodape:any
  coordenadaYAsseguir=0;
  #crudMobilidade:CrudBaseMobilidadeRepository;
  #crudPessoaJuridica:CrudBasePessoaJuridicaRepository;
  data = new Date()
  constructor() {
    this.#crudMobilidade = new CrudBaseMobilidadeRepository()
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository()
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
    let result = await this.#crudMobilidade.api.listarTodos({numero_guia:req.numero_guia,user,orgao})
    let result_efectivos = await this.#crudMobilidade.api.listar({numero_guia:req.numero_guia,user,orgao})
    let comandante_do_orgao = await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo({pessoajuridica_id:result[0].pessoajuridica_passado.id})
    try {


      let doc = new jsPDF({
        orientation: "portrait",
        format: 'a4' // Largura de 210 mm e altura de 170 mm  A5 tem 210 mm de largura e 148 mm de altura
    });

    const local_Colocacao=result[0].pessoajuridica_actual.nome_completo
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin; // Largura disponível no PDF

    // Dimensões da imagem (em mm)
    const textDirecao = result[0].pessoajuridica_passado.nome_completo.toUpperCase();

     adicionarParteSuperior(doc,textDirecao)

        // Adicionando a linha para sublinhar o texto
// Definindo a espessura da linha com base no comprimento do texto
//doc.setLineWidth(textWidth * 0.005); // Exemplo de cálculo: 0.005 é um fator de escala para ajustar a espessura


      doc.setFontSize(14);

    //CABECALHO
      doc.setFont('helvetica','normal')
      let text = `GUIA DE MARCHA N.º ${result[0].numero_guia}`

      doc.text("GUIA DE MARCHA", pageWidth / 2, 70, { align: "center" });
      doc.text( `N.º ${result[0].numero_guia}`, pageWidth / 2, 75, { align: "center" });
      /* await this.escreverTextoJustificado(doc,text,72,maxWidth,true)
      await this.escreverTextoJustificado(doc,text,72,maxWidth,true) */

      /* doc.line(
        (pageWidth - textWidth) / 2, // Posição inicial X
        72, // Posição inicial Y (logo abaixo do texto)
        (pageWidth + textWidth) / 2, // Posição final X
        72 // Posição final Y
      ); */

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);


       text = `
      Faz-se constar às autoridades e a quem o conhecimento desta competir,
      que marcha desta Direcção para ${local_Colocacao.split(' ')[0][0]=='D'?'a':'o'} ${local_Colocacao}/PNA, onde foi
      Transferido, ao abrigo do Despacho n.º ${result[0].despacho_descricao},
       de Sua Excelência Comandante Geral/PNA ${result[0].numero_ordem?',publicado na Ordem de Serviço n.º'+result[0].numero_ordem:''},
       ${result_efectivos.length>1?'os efectivos':'o efectivo'} abaixo descrito:`;


      await this.escreverTextoJustificado(doc,text,85,maxWidth,false,10,10)

      let initialValue=135
      const qtd_efectivos=result_efectivos.length
      const efectivos:any=[]
        result_efectivos.forEach(async(element,index) => {
          text = `NIP:${element.nip} ${element.patente_nome} |**${element.nome_completo}**| ${element.numero_agente?'NAS:'+ element.numero_agente:''}`;
          efectivos.push(text)
        });

      initialValue=await this.adicionarLinhas(doc,efectivos,20,initialValue)

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);

      text = ` E para que não se lhe ponham impedimento, mandei passar a presente Guia,
      que vai por mim assinada e devidamente autenticada com selo branco em uso nesta Direcção.`;

      initialValue=await this.quebrarPagina(doc,qtd_efectivos,12,12,initialValue)
      initialValue=initialValue==10?30:initialValue
      initialValue=await this.escreverTextoJustificado(doc,text,initialValue+3,maxWidth,false,10,10)



      doc.setFontSize(14);
      initialValue=await this.quebrarPagina(doc,qtd_efectivos,6,11,initialValue)
      initialValue=initialValue==10?40:initialValue
      await adicionarParteInferior(doc,local_Colocacao,maxWidth,comandante_do_orgao,initialValue+15,
        {
          nome_completo:user.nome_completo,
          patente_nome:user.patente_nome,
          siglq:orgao.sigla
        }
      )
      return retorno_da_pagina(doc,response)

    } catch (error) {
      console.error('Error generating PDF:', error)
      response.status(500).send('Error generating PDF')
    }

  }



  async adicionarLinhas(doc, funcionarios, currentX, currentY) {
    doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
    const alturaLinha = 10; // Ajuste a altura da linha conforme necessário
    let startX = currentX;
    let startY = currentY;
    const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin;
    const alturaPagina = doc.internal.pageSize.height; // Altura total da página (A5)
    const alturaRodape = 20; // Definir a altura do rodapé (ajuste conforme necessário)

    // Função para garantir que há espaço suficiente antes de adicionar uma nova linha
    const verificarQuebraPagina = async (doc, startY) => {
      if (startY + alturaLinha > alturaPagina - alturaRodape - 20) { // Menos 10mm para margens
        await this.adicionarRodape(doc, 40, alturaPagina - alturaRodape + 5, logoRodaPe,false); // Adiciona o rodapé antes da quebra
        doc.addPage(); // Adiciona uma nova página
        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        return 20; // Reinicia a posição vertical após a quebra de página
      }
      return startY;
    };


    // Itera sobre os funcionários
    for (let indexs = 0; indexs < funcionarios.length; indexs++) {
      const funcionario = funcionarios[indexs];
      startX = currentX; // Recomeça a posição de X para cada linha de funcionário

      // Verifica se há espaço suficiente para adicionar a linha
      startY = await verificarQuebraPagina(doc, startY);

      //doc.text(funcionario, startX + 2, startY + 5); // Adiciona o texto dentro da célula
      await this.escreverTextoComNegrito(doc,funcionario, startY + 2,maxWidth,'',true,startX + 2)//230

      startY += alturaLinha; // Move para a próxima linha
    }

  return startY

  }


  async escreverTextoJustificado(doc, text, startY, maxWidth, centered = false, lineHeight = 6, _marginLeft = 20, _marginRight = 20) {
    let currentY=startY
    const formattedText = text.replace(/\s+/g, " ").trim();

    // Ajusta maxWidth para considerar as margens
    const marginLeft = 20, marginRight = 5
    const effectiveMaxWidth = maxWidth - marginLeft - marginRight;

    // Quebrar o texto em linhas ajustadas ao effectiveMaxWidth
    const lines = doc.splitTextToSize(formattedText, effectiveMaxWidth);

    lines.forEach((line, index) => {
        const isLastLine = index === lines.length - 1;
         currentY = startY + index * lineHeight; // Calcula a posição Y para cada linha

        if (centered) {
            // Texto centralizado
            const textWidth = doc.getTextWidth(line);
            const offset = (effectiveMaxWidth - textWidth) / 2; // Calcula o deslocamento necessário para centralizar
            doc.text(line, marginLeft + offset, currentY);
        } else if (isLastLine) {
            // Última linha não justificada, apenas alinhada à esquerda
            doc.text(line, marginLeft, currentY);
        } else {
            // Justificar a linha
            const words = line.split(" "); // Quebra a linha em palavras
            const totalWords = words.length;
            const totalWordWidth = words.reduce(
                (acc, word) => acc + doc.getTextWidth(word),
                0
            );

            // Calculo do espaço entre as palavras
            const spaceWidth = (effectiveMaxWidth - totalWordWidth) / (totalWords - 1);

            let currentX = marginLeft; // Início da linha

            words.forEach((word, wordIndex) => {
                doc.text(word, currentX, currentY);
                currentX += doc.getTextWidth(word) + (wordIndex < totalWords - 1 ? spaceWidth : 0);
            });
        }
    });

    return currentY;
}


 async quebrarPagina(doc:any,elementos:number,qtdmin:number,qtdmax:number,currentY)
{
  if(elementos>qtdmin-1 && elementos<=qtdmax)
  {
    doc.addPage();
    return 10;
  }
  return currentY;
}

async escreverTextoComNegrito(doc: jsPDF, text: string, startY: number, maxWidth: number, text_final: string = '', centered = false, startX: number = 10) {
  const lineHeight = 6; // Espaçamento entre linhas
  let currentY = startY; // Posição Y inicial
  let currentX = startX; // Posição X inicial

  // Função para escrever o texto no PDF com negrito
  function writeTextToPDF(textToWrite, startingX) {
    const formattedText = textToWrite.replace(/\s+/g, " ").trim(); // Limpeza de espaços extras
    const lines = doc.splitTextToSize(formattedText, maxWidth); // Quebra o texto conforme o maxWidth

    lines.forEach((line, index) => {
      const currentLineY = currentY + index * lineHeight; // Calcula a posição Y para cada linha

      // Verifica se a linha atual ultrapassa o limite da página
      if (currentLineY > doc.internal.pageSize.height - 20) { // Deixe um espaço de 20 unidades do fundo
        doc.addPage(); // Adiciona uma nova página
        currentY = 10; // Reseta a posição Y para o topo da nova página
        this.pageWidth = doc.internal.pageSize.getWidth();
      }

      // Quebra a linha em palavras
      const words = line.split("|");
      let currentLineX = startingX; // Começar a escrever a partir de startingX

      words.forEach((word, wordIndex) => {
        let isBold = false;
        let cleanWord = word;

        // Verifica se a palavra está entre ** e deve ser negrito
        if (word.startsWith("**") && word.endsWith("**")) {
          isBold = true;
          cleanWord = word.slice(2, -2); // Remove os ** para que o texto não apareça com os delimitadores
        }

        // Define a fonte como negrito ou normal
        doc.setFont("helvetica", isBold ? "bold" : "normal");

        // Desenha a palavra no PDF
        doc.text(cleanWord, currentLineX, currentLineY, { maxWidth: maxWidth });

        // Atualiza a posição X para a próxima palavra
        currentLineX += doc.getTextWidth(cleanWord) + doc.getTextWidth(" "); // Considera o espaço entre as palavras
      });
    });

    // Atualiza a posição Y após o texto
    currentY += lines.length * lineHeight; // Incrementa a posição Y após o bloco de texto
  }

  // Primeiro texto
  writeTextToPDF(text, currentX);

  // Ajuste a posição Y após o primeiro texto (um espaçamento extra de 2 linhas de altura)
  currentY += lineHeight * 0; // Ajuste o espaçamento entre os textos (pode aumentar esse valor)

  writeTextToPDF(text_final, currentX);
}


async adicionarRodape(doc, larguraTotal, alturaTotal,imgUrl,rodapeFinal:boolean=true) {
  const rodapeY = alturaTotal - 20; // Define a posição vertical do rodapé
  const margemEsquerda = 10;

  // Título 1 e Título 2
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  // Título 1 (Esquerda)
  doc.text("AV 4 de Fevereiro, nº 206, Marginal de Luanda, 1.º andar, edificio sede da PNA.", margemEsquerda, rodapeY);
  doc.text("Telefone: + (244) 222 339 962 E-mail:dqp@pn.gov.ao.", margemEsquerda, rodapeY+5);

  // Imagem (no centro, por exemplo)

  if(rodapeFinal)
    {
      doc.addImage(imgUrl, 'JPEG',larguraTotal - 68, rodapeY-8, 20, 15);
      // Título 2 (Direita)
     doc.text("POLICIA NACIONAL DE ANGOLA", larguraTotal - 47, rodapeY);
    }else {
      {
        doc.addImage(imgUrl, 'JPEG',larguraTotal+100, rodapeY-6, 20, 15);
        // Título 2 (Direita)
       doc.text("POLICIA NACIONAL DE ANGOLA", larguraTotal+120, rodapeY+2);
      }
    }

}

}
