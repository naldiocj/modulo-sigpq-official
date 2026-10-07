import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

/**
|--------------------------------------------------------------------------
| Resposta de PDF "enterprise"
|--------------------------------------------------------------------------
|
| Devolve o PDF directamente em memória (buffer). Substitui o padrão antigo
| `doc.save('output.pdf') + response.download(...)`, que escrevia num ficheiro
| único partilhado — duas requisições concorrentes sobrepunham-se e o cliente
| recebia o relatório de outro utilizador.
|
*/

/** Remove caracteres ilegais do nome do ficheiro para o Content-Disposition. */
function nomeSeguro(nome: string): string {
  return (nome || "relatorio.pdf")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .concat(".pdf");
}

export function enviarPdf(
  response: HttpContextContract["response"],
  doc: any,
  nomeFicheiro: string = "relatorio"
): any {
  const conteudo: Buffer = Buffer.from(doc.output("arraybuffer"));

  response.header("Content-Type", "application/pdf");
  response.header(
    "Content-Disposition",
    `inline; filename="${nomeSeguro(nomeFicheiro)}"`
  );
  response.header("Content-Length", String(conteudo.length));
  response.header("Cache-Control", "no-store, no-cache, must-revalidate");
  response.header("X-Content-Type-Options", "nosniff");

  return response.send(conteudo);
}
