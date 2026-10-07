import { getMarca, logoCabecalho, logoRodape } from "../../config/marca";

/**
|--------------------------------------------------------------------------
| Layout institucional dos PDFs (cabeçalho + rodapé)
|--------------------------------------------------------------------------
|
| Fonte única de identidade visual: todos os relatórios herdam a marca
| activa a partir de `src/relatorios/config/marca.ts`.
| Substitui as 4 cópias de rodapé "hardcoded" com morada institucional.
|
*/

const QRCode = require("qrcode");

/** Extensão do logotipo → formato esperado pelo jsPDF. */
function formatoImagem(caminho: string): "PNG" | "JPEG" {
  return /\.jpe?g$/i.test(caminho || "") ? "JPEG" : "PNG";
}

/**
 * Cabeçalho institucional: logotipo centrado + república/ministério/órgão +
 * texto da direcção/unidade.
 */
export function adicionarCabecalhoInstitucional(
  doc: any,
  textoDirecao: string
): void {
  const marca = getMarca();
  const pageWidth = doc.internal.pageSize.getWidth();

  const imgWidth = 25.6;
  const imgHeight = 23.2;
  const xImg = (pageWidth - imgWidth) / 2;
  const yImg = 6;

  const logo = logoCabecalho();
  if (logo) {
    doc.addImage(
      logo,
      formatoImagem(marca.logoCabecalho),
      xImg,
      yImg,
      imgWidth,
      imgHeight
    );
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(marca.republia, pageWidth / 2, 34, { align: "center" });

  doc.setFontSize(12);
  doc.text(marca.orgaoSuperior, pageWidth / 2, 39, { align: "center" });
  doc.text(marca.separadorInstitucional, pageWidth / 2, 44, {
    align: "center",
  });
  doc.text(marca.orgao, pageWidth / 2, 48, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(textoDirecao, pageWidth / 2, 54, { align: "center" });
  doc.setFont("helvetica", "normal");
}

export interface RodapeOpcoes {
  /** Código de verificação (QR) — desenha apenas se fornecido. */
  dadosQr?: any;
  /** Desenha o logotipo à direita do rodapé (por omissão sim). */
  comLogo?: boolean;
}

/**
 * Rodapé institucional: contactos à esquerda, logotipo + nome do órgão à
 * direita e (opcionalmente) QR de autenticação do documento.
 */
export async function adicionarRodapeInstitucional(
  doc: any,
  opcoes: RodapeOpcoes = {}
): Promise<void> {
  const marca = getMarca();
  const { dadosQr, comLogo = true } = opcoes;

  const larguraTotal = doc.internal.pageSize.getWidth();
  const alturaTotal = doc.internal.pageSize.getHeight();
  const rodapeY = alturaTotal - 20;
  const margemEsquerda = 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  // Contactos (esquerda) — apenas os campos preenchidos na marca activa.
  const linhasContacto: string[] = [];
  if (marca.morada) linhasContacto.push(marca.morada);
  const contactos = [
    marca.telefone && `Telefone: ${marca.telefone}`,
    marca.email && `E-mail: ${marca.email}`,
  ]
    .filter(Boolean)
    .join("  ");
  if (contactos) linhasContacto.push(contactos);

  linhasContacto.forEach((linha, index) => {
    doc.text(linha, margemEsquerda, rodapeY + index * 5);
  });

  // Logotipo + nome do órgão (direita).
  if (comLogo) {
    const logo = logoRodape();
    if (logo) {
      doc.addImage(
        logo,
        formatoImagem(marca.logoRodape),
        larguraTotal - 68,
        rodapeY - 8,
        20,
        15
      );
    }
    doc.text(marca.orgao, larguraTotal - 47, rodapeY);
  }

  // QR de autenticação do documento.
  if (dadosQr) {
    try {
      const qrCodeUrl: any = await gerarQrcode(dadosQr);
      doc.addImage(qrCodeUrl, "JPEG", larguraTotal - 35, rodapeY - 40, 30, 25);
    } catch {
      // QR é opcional: um falha nunca deve impedir a emissão do relatório.
    }
  }
}

/** Gera o QR com os metadados do documento emitido. */
export function gerarQrcode(dados: any): Promise<string> {
  const opcoes = {
    color: { dark: "#000000", light: "#FFFFFF" },
    margin: 1,
  };

  return QRCode.toDataURL(JSON.stringify(dados), opcoes);
}
