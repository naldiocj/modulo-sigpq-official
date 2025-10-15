import { logoInsignia, logoRodaPe } from "../../../../../../app/@piips/shared/metodo-generico/helpers";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
const QRCode = require('qrcode');
export function adicionarParteSuperior(doc:any,textDirecao:string)
{
     const pageWidth = doc.internal.pageSize.getWidth();
  // Dimensões da imagem (em mm)
      const imgWidth = 25.6; // Largura da imagem
      const imgHeight = 23.2; // Altura da imagem

      // Posição centralizada
      const xImg = (pageWidth - imgWidth) / 2; // Centro horizontal
      const yImg = 6; // Margem superior (ajustável)
        doc.addImage(logoInsignia, "PNG", xImg, yImg, imgWidth, imgHeight);

        // Configurar fonte e tamanho
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        // Adicionar linhas de texto centralizado
        doc.text("REPÚBLICA DE ANGOLA", pageWidth / 2, 34, { align: "center" });
        doc.setFontSize(12);
        doc.text("MINISTÉRIO DO INTERIOR", pageWidth / 2, 39, { align: "center" });
        doc.text("- - - <<>> - - -", pageWidth / 2, 44, { align: "center" });
        doc.text("POLÍCIA NACIONAL DE ANGOLA", pageWidth / 2, 48, { align: "center" });
        doc.setFontSize(14);
          // Configurando a fonte para negrito
        doc.setFont("helvetica", "bold");

          // Adicionando o texto no centro da página
        doc.text(textDirecao, pageWidth / 2, 54, { align: "center" });
}

export async function adicionarParteInferior(doc:any,local_Colocacao:string,maxWidth:any,comandante_do_orgao:any,coordenada_x:number=128,agente:any,posicaoData:number=148)
{
      const data=new Date()
      const ano_em_curso=data.getFullYear();
      const mes_em_curso=data.getMonth()+1;
      const dia_em_curso=data.getDate();

      let _text = `
       "Pela ordem e pela paz, ao serviço da Nação"
      `;

      const formatar = (x) => {
        if (x > 9) {
            return x.toString(); // Converte o número para string
        } else {
            return `0${x}`; // Adiciona um zero à frente
        }
    };
    /* let _text_comparecer = `${
        local_Colocacao.toUpperCase()+'/PNA'
      }, em Luanda, aos ${formatar(dia_em_curso)}/${formatar(mes_em_curso)}/${ano_em_curso}.`
 */
      let _text_comparecer = `Emitido, aos ${formatar(dia_em_curso)}/${formatar(mes_em_curso)}/${ano_em_curso}.`

      doc.setFont("helvetica", "normal");

       //await escreverTextoJustificado(doc,_text,coordenada_x,maxWidth,true)//128

       coordenada_x=coordenada_x+12
       doc.text(_text_comparecer, 70, posicaoData, { align: "right" });
       //await escreverTextoJustificado(doc,_text_comparecer,coordenada_x,maxWidth,false)//140

       const cargo=comandante_do_orgao?.cargo_nome??'NÃO DEFINIDO'
       const cargo_categoria=comandante_do_orgao?.patente_nome??'NÃO DEFINIDO'
       const responsavel_cargo=comandante_do_orgao?.nome_completo??'NÃO DEFINIDO'
       _text = `O
       ${cargo},
      `;
      coordenada_x=coordenada_x+15
      await escreverTextoJustificado(doc,_text.toUpperCase(),coordenada_x,maxWidth,true)//155
      _text_comparecer = `${responsavel_cargo}`
      doc.setFont("helvetica", "bold");
      coordenada_x=coordenada_x+15
      await escreverTextoJustificado(doc,_text_comparecer.toUpperCase(),coordenada_x,maxWidth,true) //170
      doc.setFont("helvetica", "normal");

      _text_comparecer = `**${cargo_categoria}**`
      coordenada_x=coordenada_x+7
      await escreverTextoJustificado(doc,_text_comparecer.toUpperCase(),coordenada_x,maxWidth,true)
      await adicionarRodape(doc, doc.internal.pageSize.width, doc.internal.pageSize.height+5,logoRodaPe,agente);

}



export function retorno_da_pagina(doc:any,response:any,nome:string='relatorio-de-licencas.pdf')
  {
  // Salve o PDF em um arquivo
  const filePath = nome

  // const filePath = `app/@piips/files-mobilidade/${id}.pdf`
  doc.save(filePath);


  response.header('Content-type', 'application/pdf')
  return response.download(filePath)
  }


  export function escreverTextoJustificado_v2(doc, text, startY, maxWidth, centered = false, lineHeight = 6, _marginLeft = 20, _marginRight = 20) {
    const formattedText = text.replace(/\s+/g, " ").trim();

    // Ajusta maxWidth para considerar as margens
    const marginLeft = 20, marginRight = 5
    const effectiveMaxWidth = maxWidth - marginLeft - marginRight;

    // Quebrar o texto em linhas ajustadas ao effectiveMaxWidth
    const lines = doc.splitTextToSize(formattedText, effectiveMaxWidth);

    lines.forEach((line, index) => {
        const isLastLine = index === lines.length - 1;
        const currentY = startY + index * lineHeight; // Calcula a posição Y para cada linha

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
  }


  export async function adicionarRodape(doc, larguraTotal, alturaTotal,imgUrl,agente,rodapeFinal:boolean=true) {
    const rodapeY = alturaTotal - 20; // Define a posição vertical do rodapé
    const margemEsquerda = 10;

    // Título 1 e Título 2
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // Título 1 (Esquerda)
    //doc.text("AV 4 de Fevereiro, nº 206, Marginal de Luanda, 1.º andar, edificio sede da PNA.", margemEsquerda, rodapeY);
    doc.text("AV 4 de Fevereiro, nº 206, Marginal de Luanda, edificio sede da PNA.", margemEsquerda, rodapeY);
    doc.text("Telefone: + (244) 222 339 962 E-mail:dqp@pn.gov.ao.", margemEsquerda, rodapeY+5);

    // Imagem (no centro, por exemplo)
    const qrCodeUrl = await gerarQrcode(agente);
    if(rodapeFinal)
      {
        doc.addImage(imgUrl, 'JPEG',larguraTotal - 68, rodapeY-8, 20, 15);
        // Título 2 (Direita)
       doc.text("POLICIA NACIONAL DE ANGOLA", larguraTotal - 47, rodapeY);

       doc.addImage(qrCodeUrl, 'JPEG',larguraTotal - 35, rodapeY-40, 30, 25);
      }else {
        {
          doc.addImage(imgUrl, 'JPEG',larguraTotal+100, rodapeY-6, 20, 15);
          // Título 2 (Direita)
         doc.text("POLICIA NACIONAL DE ANGOLA", larguraTotal+120, rodapeY+2);

        doc.addImage(qrCodeUrl, 'JPEG',larguraTotal+115, rodapeY-40, 30, 25);
        }
      } 



  }

  export function gerarQrcode(agente:any) {
    return new Promise((resolve, reject) => {
      const dataAtual = new Date();
      const options = {
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        margin: 1
      };
  
      //const nomeAgente = 'Hélio Vicente Buozo Viegas';
      const nome_completo_do_agente = agente?.nome_completo;
      const patente = agente?.patente_nome;
      const colocacao = agente?.colocacao;
      const nome_do_documento = agente?.nome_do_documento;
      const data_da_emissao_do_documento = `${dataAtual.getDate()}-${dataAtual.getMonth() + 1}-${dataAtual.getFullYear()}`;
  
      const dados = {
        patente,
        colocacao,
        nome_completo_do_agente,
        data_da_emissao_do_documento,
        nome_do_documento:nome_do_documento
      };
  
      const qrCodeValue = JSON.stringify(dados);
      QRCode.toDataURL(qrCodeValue, options)
        .then((url) => {
          resolve(url);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  export function escreverTextoJustificado(doc, text, startY, maxWidth, centered = false) {
    const margin = 10; // Margem horizontal
    const lineHeight = 6; // Espaçamento entre linhas
    const formattedText = text.replace(/\s+/g, " ").trim();

    // Quebrar o texto em linhas ajustadas ao maxWidth
    const lines = doc.splitTextToSize(formattedText, maxWidth);

    lines.forEach((line, index) => {
        const isLastLine = index === lines.length - 1;
        const currentY = startY + index * lineHeight; // Calcula a posição Y para cada linha

        if (centered) {
            // Texto centralizado
            const textWidth = doc.getTextWidth(line);
            const offset = (maxWidth - textWidth) / 2; // Calcula o deslocamento necessário para centralizar
            doc.text(line, margin + offset, currentY);
        } else if (isLastLine) {
            // Última linha não justificada, apenas alinhada à esquerda
            doc.text(line, margin, currentY);
        } else {
            // Justificar a linha
            const words = line.split(" "); // Quebra a linha em palavras
            const totalWords = words.length;
            const totalWordWidth = words.reduce(
                (acc, word) => acc + doc.getTextWidth(word),
                0
            );
            const spaceWidth = (maxWidth - totalWordWidth) / (totalWords - 1);

            let currentX = margin; // Início da linha

            words.forEach((word, wordIndex) => {
                doc.text(word, currentX, currentY);
                currentX +=
                    doc.getTextWidth(word) +
                    (wordIndex < totalWords - 1 ? spaceWidth : 0);
            });
        }
    });
}

  export function escreverTextoComNegrito(doc: any, text: string, startY: number, maxWidth: number, text_final: string = '', centered = false, startX: number = 10) {
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
