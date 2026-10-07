import { jsPDF } from "jspdf";
import { getMarca } from "../../config/marca";
import { adicionarCabecalhoInstitucional } from "./pdf-marca";

/**
|--------------------------------------------------------------------------
| Motor de relatório "enterprise" — Serviço de Investigação Criminal
|--------------------------------------------------------------------------
|
| Fonte ÚNICA de layout para os relatórios de tabela do módulo sigpq:
|
|   • Cabeçalho institucional (logotipo + república + ministério + órgão)
|   • Bloco de título com barra de realce e subtítulo
|   • Faixa de metadados de emissão (emissão, emitido por, nº de registos,
|     filtros aplicados)
|   • Tabela com cabeçalho escuro (#383838), linha de realce dourada
|     (#eba510), linhas zebradas e repetição do cabeçalho nas quebras
|   • Rodapé paginado em todas as páginas ("Página N de M") com contactos
|
| A identidade vem de `src/relatorios/config/marca.ts` (SIC). O PDF é
| devolvido em memória por `pdf-response.enviarPdf` — nunca escreve em disco.
|
*/

export interface ColunaRelatorio {
  /** Chave da linha (ex.: 'nome_completo_apelido') ou 'ordem' para o nº. */
  id: string;
  /** Cabeçalho da coluna (é convertido para maiúsculas no PDF). */
  texto: string;
  /** Peso relativo da largura (percentagem somada entre colunas). */
  largura: number;
}

export interface FiltroRelatorio {
  rotulo: string;
  valor: string;
}

export interface OpcoesRelatorio {
  orientacao?: "paisagem" | "retrato";
  titulo: string;
  subtitulo?: string;
  /** Nome de quem solicitou a emissão (payload do JWT). */
  emitidoPor?: string;
  /** Número de registos no relatório (por omissão: n.º de linhas). */
  registos?: number;
  filtros?: FiltroRelatorio[];
}

const MARGEM = 8;
const FONTE_TITULO = 13;
const FONTE_SUBTITULO = 9;
const FONTE_METADADOS = 8;
const FONTE_TABELA = 7.5;
const ALTURA_LINHA_BASE = 5;
const MAX_LINHAS_CELULA = 3;
/** Espaço reservado no fundo para o rodapé paginado. */
const AREA_RODAPE = 14;

function ehNumerico(valor: any): boolean {
  if (typeof valor === "number") {
    return Number.isFinite(valor);
  }
  if (typeof valor === "string" && valor.trim() !== "") {
    return !Number.isNaN(Number(valor.replace(/\s/g, "")));
  }
  return false;
}

function ehData(valor: any): boolean {
  return (
    typeof valor === "string" &&
    (/^\d{2}\/\d{2}\/\d{4}/.test(valor.trim()) ||
      /^\d{4}-\d{2}-\d{2}/.test(valor.trim()))
  );
}

function ehNumericoOuData(valores: any[]): "right" | "center" | "left" {
  if (valores.length > 0 && valores.every(ehNumerico)) {
    return "right";
  }
  if (valores.length > 0 && valores.every(ehData)) {
    return "center";
  }
  return "left";
}

function formatarDataHora(data: Date): string {
  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const hora = String(data.getHours()).padStart(2, "0");
  const minuto = String(data.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${data.getFullYear()} ${hora}:${minuto}`;
}

export class RelatorioPdf {
  readonly doc: jsPDF;
  private readonly marca = getMarca();

  private y = 0;
  private colunas: ColunaRelatorio[] = [];
  private larguras: number[] = [];
  private alinhamentos: string[] = [];
  private primeiraPagina = true;

  constructor(private opcoes: OpcoesRelatorio) {
    const orientacao =
      opcoes.orientacao === "retrato" ? "portrait" : "landscape";
    this.doc = new jsPDF({
      orientation: orientacao,
      unit: "mm",
      format: "a4",
      compress: true,
    });
    this.desenharCabecalho();
    this.desenharTituloEMetadados();
  }

  /** Largura útil da página (entre margens). */
  private get larguraUtil(): number {
    return this.doc.internal.pageSize.getWidth() - MARGEM * 2;
  }

  /** Altura disponível para conteúdo (acima da área de rodapé). */
  private get limiteInferior(): number {
    return this.doc.internal.pageSize.getHeight() - AREA_RODAPE;
  }

  /** Cabeçalho institucional + posição inicial de conteúdo. */
  private desenharCabecalho(): void {
    adicionarCabecalhoInstitucional(this.doc, getMarca().nome);
    this.y = 58;
  }

  /** Bloco de título + faixa de metadados (apenas na 1.ª página). */
  private desenharTituloEMetadados(): void {
    const { marca, doc } = this;
    const titulo = (this.opcoes.titulo || "Relatório").trim();

    // Barra de realce institucional (dourada) antes do título.
    doc.setFillColor(...marca.corSecundaria);
    doc.rect(MARGEM, this.y - 3.6, 1.6, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONTE_TITULO);
    doc.setTextColor(...marca.corPrimaria);
    doc.text(titulo, MARGEM + 4.5, this.y);
    this.y += 5.5;

    if (this.opcoes.subtitulo) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(FONTE_SUBTITULO);
      doc.setTextColor(110, 110, 110);
      doc.text(this.opcoes.subtitulo, MARGEM + 4.5, this.y);
      this.y += 3;
    }

    this.y += 3;

    // Faixa de metadados de emissão.
    const emitidoEm = formatarDataHora(new Date());
    const emitidoPor = this.opcoes.emitidoPor || "-";
    const registos = this.opcoes.registos ?? 0;
    const temFiltros = (this.opcoes.filtros || []).length > 0;

    const alturaFaixa = temFiltros ? 10 : 6;
    doc.setFillColor(246, 245, 240);
    doc.setDrawColor(228, 226, 216);
    doc.roundedRect(
      MARGEM,
      this.y,
      this.larguraUtil,
      alturaFaixa,
      1.2,
      1.2,
      "FD"
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONTE_METADADOS);
    doc.setTextColor(80, 80, 80);

    const linhaMetadados =
      `Emitido em: ${emitidoEm}   •   Emitido por: ${emitidoPor}` +
      `   •   ${registos} registo${registos === 1 ? "" : "s"}`;
    doc.text(linhaMetadados, MARGEM + 3, this.y + 4);

    if (temFiltros) {
      const textoFiltros = (this.opcoes.filtros || [])
        .map((f) => `${f.rotulo}: ${f.valor}`)
        .join("   |   ");
      doc.text(`Filtros aplicados: ${textoFiltros}`, MARGEM + 3, this.y + 8);
    }

    this.y += alturaFaixa + 5;
  }

  /**
   * Desenha a grelha do relatório: cabeçalho de tabela + linhas zebradas,
   * com quebra de página automática e repetição do cabeçalho.
   */
  public tabela(
    colunas: ColunaRelatorio[],
    linhas: Record<string, any>[]
  ): void {
    if (!colunas || colunas.length === 0) {
      throw new Error("O relatório precisa de pelo menos uma coluna.");
    }

    const totalPeso = colunas.reduce((acc, coluna) => acc + coluna.largura, 0);
    this.colunas = colunas;
    this.larguras = colunas.map(
      (coluna) => (this.larguraUtil * coluna.largura) / totalPeso
    );
    this.alinhamentos = colunas.map((coluna) => {
      if (coluna.id === "ordem") {
        return "center";
      }
      const valores = linhas.map((linha) => this.valorCelula(linha, coluna.id));
      return ehNumericoOuData(valores);
    });

    this.desenharCabecalhoTabela();

    linhas.forEach((linha, index) => {
      this.desenharLinha(linha, index);
    });
  }

  /** Valor de uma célula (com tolerância a chaves em maiúsculas/minúsculas). */
  private valorCelula(linha: Record<string, any>, id: string): any {
    if (linha[id] !== undefined) {
      return linha[id];
    }
    const chave = Object.keys(linha).find(
      (k) => k.toLowerCase() === id.toLowerCase()
    );
    return chave ? linha[chave] : "";
  }

  /** Acrescenta espaço vertical (documentos de texto corrido). */
  public espaco(altura: number): void {
    this.y += Math.max(0, altura);
  }

  /**
   * Escreve um parágrafo justificado à esquerda (ou centralizado), com quebra
   * de página automática. Remove marcadores legados de formatação (** e |).
   */
  public escreverParagrafo(
    texto: string,
    opcoes: {
      centralizado?: boolean;
      tamanho?: number;
      negrito?: boolean;
      alturaLinha?: number;
      cor?: [number, number, number];
    } = {}
  ): void {
    const { doc } = this;
    const tamanho = opcoes.tamanho || 11;
    const alturaLinha = opcoes.alturaLinha || tamanho * 0.62;
    const centralizado = opcoes.centralizado || false;
    const cor = opcoes.cor || [33, 33, 33];

    const limpo = String(texto)
      .replace(/\s+/g, " ")
      .replace(/\*\*/g, "")
      .replace(/\|/g, " ")
      .trim();
    if (!limpo) {
      return;
    }

    const linhas = doc.splitTextToSize(limpo, this.larguraUtil - 4);

    doc.setFont("helvetica", opcoes.negrito ? "bold" : "normal");
    doc.setFontSize(tamanho);
    doc.setTextColor(...cor);

    linhas.forEach((linha: string) => {
      if (this.y + alturaLinha > this.limiteInferior) {
        this.quebrarPagina();
      }
      if (centralizado) {
        const largura = doc.getTextWidth(linha);
        doc.text(linha, MARGEM + (this.larguraUtil - largura) / 2, this.y);
      } else {
        doc.text(linha, MARGEM + 3, this.y);
      }
      this.y += alturaLinha;
    });

    this.y += 2;
  }

  /** Desenha N linhas horizontais centradas (rascunho de guias/assinaturas). */
  public linhasGuia(quantidade: number = 2): void {
    const { doc } = this;
    const larguraLinha = Math.min(this.larguraUtil - 8, 190);
    const xInicio = MARGEM + (this.larguraUtil - larguraLinha) / 2;

    doc.setDrawColor(110, 110, 110);
    doc.setLineWidth(0.4);

    for (let i = 0; i < quantidade; i++) {
      if (this.y + 7 > this.limiteInferior) {
        this.quebrarPagina();
      }
      doc.line(xInicio, this.y, xInicio + larguraLinha, this.y);
      this.y += 7;
    }

    doc.setLineWidth(0.2);
  }

  /**
   * Bloco de assinatura institucional (documentos assinados pelo órgão):
   * data de emissão, cargo, linha de assinatura, nome e patente.
   */
  public assinatura(
    opcoes: { cargo?: string; nome?: string; patente?: string } = {}
  ): void {
    const { doc, marca } = this;
    const cargo = (opcoes.cargo || "NÃO DEFINIDO").toUpperCase();
    const nome = (opcoes.nome || "").toUpperCase();
    const patente = (opcoes.patente || "").trim();

    // O bloco precisa de ~44 mm — quebra de página se não couber.
    if (this.y + 44 > this.limiteInferior) {
      this.quebrarPagina();
    }

    const agora = new Date();
    const formatar = (x: number) => String(x).padStart(2, "0");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(
      `Emitido, aos ${formatar(agora.getDate())}/${formatar(
        agora.getMonth() + 1
      )}/${agora.getFullYear()}.`,
      MARGEM + this.larguraUtil,
      this.y,
      { align: "right" }
    );
    this.y += 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...marca.corPrimaria);
    doc.text(`O ${cargo},`, MARGEM + this.larguraUtil / 2, this.y, {
      align: "center",
    });
    this.y += 15;

    const larguraLinha = 80;
    const xLinha = MARGEM + (this.larguraUtil - larguraLinha) / 2;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.4);
    doc.line(xLinha, this.y, xLinha + larguraLinha, this.y);
    this.y += 6;

    if (nome) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(33, 33, 33);
      doc.text(nome, MARGEM + this.larguraUtil / 2, this.y, {
        align: "center",
      });
      this.y += 4.5;
    }

    if (patente) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 90);
      doc.text(patente, MARGEM + this.larguraUtil / 2, this.y, {
        align: "center",
      });
      this.y += 4.5;
    }

    doc.setLineWidth(0.2);
    this.y += 8;
  }

  /** Quebra de página: nova página + cabeçalho institucional. */
  private quebrarPagina(): void {
    this.doc.addPage();
    this.primeiraPagina = false;
    this.desenharCabecalho();
  }

  /** Quebra o texto de uma célula em linhas ajustadas à coluna. */
  private quebrarTexto(valor: any, largura: number): string[] {
    if (valor === null || valor === undefined) {
      return [""];
    }
    const texto = String(valor);
    if (texto === "") {
      return [""];
    }
    return this.doc.splitTextToSize(texto, Math.max(largura - 1.5, 8));
  }

  /** Cabeçalho da tabela: fundo escuro + texto branco + linha dourada. */
  private desenharCabecalhoTabela(): void {
    const { doc, marca } = this;
    const altura = 7;

    doc.setFillColor(...marca.corPrimaria);
    doc.rect(MARGEM, this.y, this.larguraUtil, altura, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONTE_TABELA);
    doc.setTextColor(255, 255, 255);

    let x = MARGEM;
    this.colunas.forEach((coluna, indice) => {
      doc.text(coluna.texto.toUpperCase(), x + 1.5, this.y + 4.6);
      x += this.larguras[indice];
    });

    // Linha de realce dourada sob o cabeçalho.
    doc.setDrawColor(...marca.corSecundaria);
    doc.setLineWidth(0.7);
    doc.line(
      MARGEM,
      this.y + altura,
      MARGEM + this.larguraUtil,
      this.y + altura
    );
    doc.setLineWidth(0.2);

    this.y += altura;
  }

  /** Desenha uma linha de dados (zebra) respeitando a altura das células. */
  private desenharLinha(linha: Record<string, any>, indice: number): void {
    const { doc } = this;

    const linhasTexto = this.colunas.map((coluna, i) =>
      this.quebrarTexto(this.valorCelula(linha, coluna.id), this.larguras[i])
    );
    const maxLinhas = linhasTexto.reduce(
      (max, actual) => Math.max(max, actual.length),
      1
    );
    const altura =
      Math.max(1, Math.min(MAX_LINHAS_CELULA, maxLinhas) * ALTURA_LINHA_BASE) +
      1.4;

    // Quebra de página antes de escrever se a linha não couber.
    if (this.y + altura > this.limiteInferior) {
      this.quebrarPagina();
      this.desenharCabecalhoTabela();
    }

    // Fundo zebrado (linhas pares alternam).
    const zebra = indice % 2 === 1;
    const corZebra: [number, number, number] = zebra
      ? [244, 243, 238]
      : [255, 255, 255];
    doc.setFillColor(...corZebra);
    doc.rect(MARGEM, this.y, this.larguraUtil, altura, "F");

    // Separador sutil entre linhas.
    doc.setDrawColor(228, 228, 224);
    doc.line(
      MARGEM,
      this.y + altura,
      MARGEM + this.larguraUtil,
      this.y + altura
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(FONTE_TABELA);
    doc.setTextColor(33, 33, 33);

    let x = MARGEM;
    this.colunas.forEach((coluna, indiceColuna) => {
      const largura = this.larguras[indiceColuna];
      const alinhamento = this.alinhamentos[indiceColuna];
      const linhas = linhasTexto[indiceColuna];
      const centroVertical =
        this.y + (altura - linhas.length * ALTURA_LINHA_BASE) / 2 + 2.6;

      linhas.forEach((texto, indiceLinha) => {
        const yTexto = centroVertical + indiceLinha * ALTURA_LINHA_BASE;
        if (alinhamento === "right") {
          doc.text(texto, x + largura - 1.5, yTexto, { align: "right" });
        } else if (alinhamento === "center") {
          doc.text(texto, x + largura / 2, yTexto, { align: "center" });
        } else {
          doc.text(texto, x + 1.5, yTexto);
        }
      });

      x += largura;
    });

    this.y += altura;
  }

  /**
   * Passo final: desenha o rodapé paginado em todas as páginas.
   * Chamar depois de `tabela()` e antes de `enviarPdf(...)`.
   */
  public fechar(): void {
    const { doc, marca } = this;
    const total = doc.getNumberOfPages();
    const contactos = [
      marca.morada,
      marca.telefone && `Telefone: ${marca.telefone}`,
      marca.email && `E-mail: ${marca.email}`,
    ]
      .filter(Boolean)
      .join("   •   ");

    for (let pagina = 1; pagina <= total; pagina++) {
      doc.setPage(pagina);
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text("Documento gerado electronicamente", MARGEM, pageHeight - 8);
      doc.text(
        `Página ${pagina} de ${total}`,
        pageWidth - MARGEM,
        pageHeight - 8,
        {
          align: "right",
        }
      );

      if (contactos) {
        doc.setFontSize(6.5);
        doc.setTextColor(130, 130, 130);
        doc.text(contactos, MARGEM, pageHeight - 4.5, {
          maxWidth: pageWidth - MARGEM * 2,
        });
      }
    }
  }
}
