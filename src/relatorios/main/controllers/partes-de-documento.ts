import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import {
  adicionarCabecalhoInstitucional,
  adicionarRodapeInstitucional,
  gerarQrcode as gerarQrcodeBase,
} from "../pdf/pdf-marca";
import { enviarPdf } from "../pdf/pdf-response";

/**
 * Cabeçalho institucional (logotipo + república + ministério + órgão).
 * A identidade visual vem de `src/relatorios/config/marca.ts` (identidade SIC).
 */
export function adicionarParteSuperior(doc: any, textDirecao: string) {
  adicionarCabecalhoInstitucional(doc, textDirecao);
}

export async function adicionarParteInferior(
  doc: any,
  local_Colocacao: string,
  maxWidth: any,
  comandante_do_orgao: any,
  coordenada_x: number = 128,
  agente: any,
  posicaoData: number = 148
) {
  const data = new Date();
  const ano_em_curso = data.getFullYear();
  const mes_em_curso = data.getMonth() + 1;
  const dia_em_curso = data.getDate();

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
        local_Colocacao.toUpperCase()
      }, em Luanda, aos ${formatar(dia_em_curso)}/${formatar(mes_em_curso)}/${ano_em_curso}.`
 */
  let _text_comparecer = `Emitido, aos ${formatar(dia_em_curso)}/${formatar(
    mes_em_curso
  )}/${ano_em_curso}.`;

  doc.setFont("helvetica", "normal");

  //await escreverTextoJustificado(doc,_text,coordenada_x,maxWidth,true)//128

  coordenada_x = coordenada_x + 12;
  doc.text(_text_comparecer, 70, posicaoData, { align: "right" });
  //await escreverTextoJustificado(doc,_text_comparecer,coordenada_x,maxWidth,false)//140

  const cargo = comandante_do_orgao?.cargo_nome ?? "NÃO DEFINIDO";
  const cargo_categoria = comandante_do_orgao?.patente_nome ?? "NÃO DEFINIDO";
  const responsavel_cargo =
    comandante_do_orgao?.nome_completo ?? "NÃO DEFINIDO";
  _text = `O
       ${cargo},
      `;
  coordenada_x = coordenada_x + 15;
  await escreverTextoJustificado(
    doc,
    _text.toUpperCase(),
    coordenada_x,
    maxWidth,
    true
  ); //155
  _text_comparecer = `${responsavel_cargo}`;
  doc.setFont("helvetica", "bold");
  coordenada_x = coordenada_x + 15;
  await escreverTextoJustificado(
    doc,
    _text_comparecer.toUpperCase(),
    coordenada_x,
    maxWidth,
    true
  ); //170
  doc.setFont("helvetica", "normal");

  _text_comparecer = `**${cargo_categoria}**`;
  coordenada_x = coordenada_x + 7;
  await escreverTextoJustificado(
    doc,
    _text_comparecer.toUpperCase(),
    coordenada_x,
    maxWidth,
    true
  );
  await adicionarRodapeInstitucional(doc, { dadosQr: dadosQrDoAgente(agente) });
}

/**
 * Devolve o PDF gerado ao cliente (em memória — sem ficheiro em disco).
 * Mantém a assinatura histórica `retorno_da_pagina(doc, response, nome)`.
 */
export function retorno_da_pagina(
  doc: any,
  response: any,
  nome: string = "relatorio-de-licencas.pdf"
) {
  return enviarPdf(response, doc, nome.replace(/\.pdf$/i, ""));
}

export function escreverTextoJustificado_v2(
  doc,
  text,
  startY,
  maxWidth,
  centered = false,
  lineHeight = 6,
  _marginLeft = 20,
  _marginRight = 20
) {
  const formattedText = text.replace(/\s+/g, " ").trim();

  // Ajusta maxWidth para considerar as margens
  const marginLeft = 20,
    marginRight = 5;
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
      const spaceWidth =
        (effectiveMaxWidth - totalWordWidth) / (totalWords - 1);

      let currentX = marginLeft; // Início da linha

      words.forEach((word, wordIndex) => {
        doc.text(word, currentX, currentY);
        currentX +=
          doc.getTextWidth(word) +
          (wordIndex < totalWords - 1 ? spaceWidth : 0);
      });
    }
  });
}

/** Metadados embutidos no QR de autenticação do documento. */
export function dadosQrDoAgente(agente: any) {
  if (!agente) {
    return undefined;
  }

  const dataAtual = new Date();

  return {
    patente: agente?.patente_nome,
    colocacao: agente?.colocacao,
    nome_completo_do_agente: agente?.nome_completo,
    data_da_emissao_do_documento: `${dataAtual.getDate()}-${
      dataAtual.getMonth() + 1
    }-${dataAtual.getFullYear()}`,
    nome_do_documento: agente?.nome_do_documento,
  };
}

/**
 * Rodapé institucional. Mantida a assinatura histórica (largura/altura/
 * imagem são ignoradas: a posição é calculada a partir da página activa e a
 * identidade vem da marca configurada em `src/relatorios/config/marca.ts`).
 */
export async function adicionarRodape(
  doc,
  larguraTotal,
  alturaTotal,
  imgUrl,
  agente,
  rodapeFinal: boolean = true
) {
  return adicionarRodapeInstitucional(doc, {
    dadosQr: dadosQrDoAgente(agente),
  });
}

export function gerarQrcode(agente: any): Promise<string> {
  const dados = dadosQrDoAgente(agente);

  if (!dados) {
    return Promise.resolve("");
  }

  return gerarQrcodeBase(dados);
}

export function escreverTextoJustificado(
  doc,
  text,
  startY,
  maxWidth,
  centered = false
) {
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

export function escreverTextoComNegrito(
  doc: any,
  text: string,
  startY: number,
  maxWidth: number,
  text_final: string = "",
  centered = false,
  startX: number = 10
) {
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
      if (currentLineY > doc.internal.pageSize.height - 20) {
        // Deixe um espaço de 20 unidades do fundo
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
