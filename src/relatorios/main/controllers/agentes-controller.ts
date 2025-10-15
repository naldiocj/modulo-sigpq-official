import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import AgenteRepository from '../../repositories/agentes-repositorio';

import { jsPDF } from "jspdf";
const fs = require('fs');

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper')

export default class Controller {
  #agente
  data = new Date()
  constructor() {
    this.#agente = new AgenteRepository()

  }

  tiposCabecalho() {
    return [
      {
        id: 'patente_nome', text: 'Patente', largura: 15
      },
      {
        id: 'nome_completo_apelido', text: 'Nome Completo', largura: 28
      },
      {
        id: 'nip', text: 'NIP', largura: 8
      },
      {
        id: 'numero_agente', text: 'NAS', largura: 8
      },
      {
        id: 'data_nascimento', text: 'Nascimento', largura: 10
      },
      {
        id: 'data_adesao', text: 'Ingresso', largura: 16
      }
    ]
  }

  public async buscarOpcoesDoSelector({ }): Promise<any> {

    const opcoes = this.tiposCabecalho()

    const opcoesOrdenado = opcoes//.sort((a, b) => a.id.toLowerCase().localeCompare(b.id.toLowerCase()));

    return ok(opcoesOrdenado, null);
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
      const buscarOpcoesDoSelector = this.tiposCabecalho()
      const numeroOrdem = { id: 'Ordem', text: '#', largura: 5 }

      const options = {
        ...input,
        user,
        orgao,
        valoresSelecionados: input.valoresSelecionados//.filter(item => item !== 'ordem')
      }

      const tiposCabecalho = this.tiposCabecalho()
      tiposCabecalho.unshift(numeroOrdem);
      const tiposCabecalhoPercentual: number = tiposCabecalho.reduce((a, b) => a + b.largura, 0)

      function centralizarTexto(text: string, y: number) {
        const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
        const x = (doc.internal.pageSize.width - textWidth) / 2;
        doc.text(text, x, y);
      }

      function adicionarCabecalho(doc, cabecalho, currentX, currentY) {
        const larguraTotal = doc.internal.pageSize.getWidth();
        let startX = currentX;

        cabecalho.forEach(item => {
          const larguraColuna = (larguraTotal * item.largura) / tiposCabecalhoPercentual;
          const textoEmLinhas = doc.splitTextToSize(item.text, larguraColuna);

          // Verifica se o texto é maior que a largura da coluna
          if (textoEmLinhas.length > 1) {
            doc.text(textoEmLinhas[0], startX, currentY);
          } else {
            doc.text(textoEmLinhas, startX, currentY);
          }

          startX += larguraColuna; // Move para a próxima coluna
        });
      }

      function reduzirTexto(texto: any): any {

        const palavras = texto.split(' ');
        let resultado = '';

        palavras.forEach((palavra, index) => {

          if (index === 0 || index === palavras.length - 1) {
            // Primeira ou última palavra: mantenha inalterada
            resultado += palavra + ' ';
          } else {
            // Abrevie as palavras do meio
            resultado += `${palavra.charAt(0).toUpperCase()}. `;
          }
        });
        return resultado.trim();
      }

      function ajustarTexto(doc, headers, currentX, currentY) {

        const chaves = Object.keys(headers);
        let columnWidth: number

        for (const chave of chaves) {
          const column: any = tiposCabecalho.find((o: any) => o.id == chave)
          columnWidth = (doc.internal.pageSize.getWidth() * column.largura) / tiposCabecalhoPercentual;

          if (headers[column.id].length > 1) {
            doc.text(reduzirTexto(headers[column.id]), currentX, currentY);
          } else {
            doc.text(reduzirTexto(headers[column.id]), currentX, currentY);
          }
          currentX += columnWidth; // Move para a próxima coluna
        }

      }

      const agentes = await this.#agente.listarTodos(options)

      let doc = new jsPDF({
        orientation: "landscape",
        format: 'a4'
      });

      let x = 20
      let y = 30

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      centralizarTexto(`Relatório de ${this.data.getFullYear()}`, 10);

      const headerActivo = buscarOpcoesDoSelector.filter((item: any) => options.valoresSelecionados.includes(item.id))
      headerActivo.unshift(numeroOrdem);

      adicionarCabecalho(doc, headerActivo, x, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      y = 40
      let contador = 0

      for (const agente of agentes) {
        contador += 1

        const atributosFiltrados = {};

        options.valoresSelecionados.forEach(key => {
          if (agente.hasOwnProperty(key)) {
            if ([null, 'null'].includes(agente[key])) {
              atributosFiltrados[key] = '------------';
            } else {
              atributosFiltrados[key] = agente[key]
            }
          }
        });

        const adicionarOrdem = {
          'Ordem': String(contador),
          ...atributosFiltrados
        }

        ajustarTexto(doc, adicionarOrdem, x, y);

        y += 10; // Posição inicial da linha

        if (y > doc.internal.pageSize.getHeight() - 10) {
          doc.addPage();
          y = 20; // Reinicia a posição Y para o topo da nova página
        }

      }

      let totalPages = doc.getNumberOfPages(); // Obter o número total de páginas

      let fontSize = 9;
      doc.setFontSize(fontSize);
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Definir a página atual
        let pageNumber = 'Página ' + i + ' de ' + totalPages;
        let pageWidth = doc.internal.pageSize.width;
        let pageHeight = doc.internal.pageSize.height;

        let textWidth = doc.getStringUnitWidth(pageNumber) * fontSize; // Largura do texto
        let textX = pageWidth - (textWidth * 0.5); // Posição X

        doc.text(pageNumber, textX, pageHeight - 5);
      }

      // Salve o PDF em um arquivo
      const filePath = 'output.pdf'

      // const filePath = `app/@piips/files-mobilidade/${id}.pdf`
      doc.save(filePath);

      // Remover o arquivo após a sua utilização
      // fs.unlink(nomeArquivo, (err) => {
      //   if (err) {
      //     console.error('Erro ao remover o arquivo:', err);
      //     return;
      //   }
      //   console.log('Arquivo removido com sucesso!');
      // });

      response.header('Content-type', 'application/pdf')
      return response.download(filePath)

    } catch (error) {
      console.error('Error generating PDF:', error)
      response.status(500).send('Error generating PDF')
    }

  }

}
