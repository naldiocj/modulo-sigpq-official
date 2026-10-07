import * as fs from "fs";

/**
|--------------------------------------------------------------------------
| Marca institucional dos relatórios — SIC
|--------------------------------------------------------------------------
|
| Identidade visual ÚNICA usada em todos os PDFs gerados pelo módulo de
| relatórios (aplicação do Serviço de Investigação Criminal — identidade
| única, sem suporte a outra força).
|
| Os campos de contacto podem ser sobrepostos por variáveis de ambiente,
| sem alterar código:
|
|   BRAND_MORADA=...  BRAND_TELEFONE=...  BRAND_EMAIL=...
|   BRAND_LOGO_CABECALHO=caminho/para/logo.png
|
| Deve espelhar `frontend/src/app/config/sic.config.ts`.
|
*/

export interface MarcaRelatorio {
  id: string;
  nome: string;
  sigla: string;
  aplicacao: string;
  orgao: string;
  orgaoSuperior: string;
  republia: string;
  separadorInstitucional: string;
  lema: string;
  morada: string;
  telefone: string;
  email: string;
  /** Caminhos relativos à raiz da aplicação (process.cwd()) */
  logoCabecalho: string;
  logoRodape: string;
  /** Paleta institucional (RGB) */
  corPrimaria: [number, number, number];
  corSecundaria: [number, number, number];
}

const IMAGEM_RESERVA = "app/@piips/shared/public/img/logo-sic.png";

function env(nome: string, valorPorOmissao: string = ""): string {
  const valor = process.env[nome];
  return valor && valor.trim() !== "" ? valor : valorPorOmissao;
}

let marcaActiva: MarcaRelatorio | null = null;

/** Devolve a marca institucional (SIC) com as sobreposições do ambiente. */
export function getMarca(): MarcaRelatorio {
  if (marcaActiva) {
    return marcaActiva;
  }

  marcaActiva = {
    id: "sic",
    nome: "Serviço de Investigação Criminal",
    sigla: "SIC",
    aplicacao: env("BRAND_APLICACAO", "SISTEMA DE GESTÃO DE RECURSOS HUMANOS"),
    orgao: "SERVIÇO DE INVESTIGAÇÃO CRIMINAL",
    orgaoSuperior: "MINISTÉRIO DO INTERIOR",
    republia: "REPÚBLICA DE ANGOLA",
    separadorInstitucional: "- - - <<>> - - -",
    lema: "Inteligência – Audácia – Lealdade",
    morada: env("BRAND_MORADA", ""),
    telefone: env("BRAND_TELEFONE", ""),
    email: env("BRAND_EMAIL", ""),
    logoCabecalho: env("BRAND_LOGO_CABECALHO", IMAGEM_RESERVA),
    logoRodape: env("BRAND_LOGO_RODAPE", IMAGEM_RESERVA),
    corPrimaria: [56, 56, 56], // #383838 (AppConfig.sic.useColor)
    corSecundaria: [235, 165, 16], // #eba510 (AppConfig.sic.colorPainel)
  };

  return marcaActiva;
}

const cacheImagens: Record<string, string> = {};

/**
 * Lê uma imagem do disco em base64 (com cache). Nunca lança erro: se o
 * ficheiro não existir, cai na imagem de reserva para não partir o boot
 * nem a geração do relatório.
 */
export function imagemEmBase64(caminho: string): string {
  if (cacheImagens[caminho] !== undefined) {
    return cacheImagens[caminho];
  }

  let conteudo = "";
  try {
    conteudo = fs.readFileSync(caminho, "base64");
  } catch {
    try {
      conteudo = fs.readFileSync(IMAGEM_RESERVA, "base64");
    } catch {
      conteudo = "";
    }
  }

  cacheImagens[caminho] = conteudo;
  return conteudo;
}

/** Logotipo do cabeçalho (base64). */
export function logoCabecalho(): string {
  return imagemEmBase64(getMarca().logoCabecalho);
}

/** Logotipo do rodapé (base64). */
export function logoRodape(): string {
  return imagemEmBase64(getMarca().logoRodape);
}
