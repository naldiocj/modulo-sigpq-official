import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { jsPDF } from "jspdf";
import { logoInsignia, logoRodaPe } from '../../../../../../app/@piips/shared/metodo-generico/helpers';
import { adicionarParteInferior, adicionarParteSuperior } from './partes-de-documento';

import CrudBasePessoaJuridicaRepository from '../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export';
const fs = require('fs');

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper')

export default class Controller {
  base64Image_rodape:any
  #crudPessoaJuridica:CrudBasePessoaJuridicaRepository;
  data = new Date()
  constructor() {
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository()
  }

  tiposCabecalho() {
    return [
      {
        id: 'nip', text: 'NIP', largura:10
      },
      {
        id: 'patente_nome', text: 'Patente'.toUpperCase(), largura: 25
      },
      {
        id: 'nome_completo_apelido', text: 'Nome Completo'.toUpperCase(), largura: 35
      },
      /* {
        id: 'sexo', text: 'Orgão'.toUpperCase(), largura: 10
      } */

      /* {
        id: 'numero_agente', text: 'NAS', largura: 10
      },
      {
        id: 'sexo', text: 'Orgão'.toUpperCase(), largura: 10
      } *//* ,
      {
        id: 'data_nascimento', text: 'Nascimento'.toUpperCase(), largura: 10
      },
      {
        id: 'data_adesao', text: 'Ingresso'.toUpperCase(), largura: 16
      } */
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
      const numeroOrdem = { id: 'Ordem', text: 'N', largura: 4 }

      const valoresSelecionados = [
        'patente_nome',
        'nome_completo_apelido',
        'nip',
        'numero_agente',
        'sexo'
      ];
      const options = {
        ...input,
        user,
        orgao
      }
      //console.log("Valores selecionados:",input)

      const tiposCabecalho = this.tiposCabecalho()
      tiposCabecalho.unshift(numeroOrdem);
      const tiposCabecalhoPercentual: number = tiposCabecalho.reduce((a, b) => a + b.largura, 0)


      const listaFuncionarios = JSON.parse(options.agentes)
      let comandante_do_orgao = await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo({pessoajuridica_id:options.orgao.id})


      //console.log("Funcionarios:",listaFuncionarios)

      let doc = new jsPDF({
        orientation: "portrait",
        format: 'a4'
      });

       const base64Image = logoInsignia;
        this.base64Image_rodape = logoRodaPe;
       const pageWidth = doc.internal.pageSize.getWidth();
      const local_Colocacao=options.orgao.nome_completo
       await adicionarParteSuperior(doc,local_Colocacao)
      doc.setFont("helvetica", "bold"); // Fonte helvetica em negrito
      doc.setFontSize(16); // Tamanho do texto

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);


      //doc.text(`RELAÇÃO NOMINAL DOS EFECTIVOS (${listaFuncionarios.length}).`, 10, 90);

      let cordenadaX = 30;
      let coordenadaY = 100;

      const headerActivo = buscarOpcoesDoSelector.filter((item: any) => valoresSelecionados.includes(item.id));
      headerActivo.unshift(numeroOrdem);


      await this.adicionarCabecalhoTabela(doc, headerActivo,cordenadaX,coordenadaY);

      coordenadaY=await this.adicionarLinhasTabela(doc, headerActivo,listaFuncionarios,cordenadaX,coordenadaY+10)
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin;
      await adicionarParteInferior(doc,local_Colocacao,maxWidth,comandante_do_orgao,coordenadaY+40,
        {
          nome_completo:user.nome_completo,
          patente_nome:user.patente_nome,
          siglq:orgao.sigla
        }
      )

      //await this.adicionarRodape(doc, doc.internal.pageSize.width, doc.internal.pageSize.height,this.base64Image_rodape);

      // Salve o PDF em um arquivo
      const filePath = 'relatorio-de-licencas.pdf'

      // const filePath = `app/@piips/files-mobilidade/${id}.pdf`
      doc.save(filePath);


      response.header('Content-type', 'application/pdf')
      return response.download(filePath)

    } catch (error) {
      console.error('Error generating PDF:', error)
      response.status(500).send('Error generating PDF')
    }

  }



  async adicionarCabecalhoTabela(doc, cabecalho, currentX, currentY) {
    const larguraTotal = doc.internal.pageSize.getWidth();
    const larguraPaginaPortatil = larguraTotal; // A largura será adaptada ao formato "Portátil"
    const tiposCabecalhoPercentual = 100; // Ajuste conforme a sua necessidade
    const alturaLinha = 10; // Ajuste a altura da linha conforme necessário
    let startX = currentX;
    let startY = currentY;

    // Desenha o cabeçalho da tabela
    cabecalho.forEach(item => {
      // Ajustando a largura das colunas considerando o novo formato de página
      const larguraColuna = (larguraPaginaPortatil * item.largura) / tiposCabecalhoPercentual;

      // Desenha o retângulo para cada célula do cabeçalho
      doc.setFillColor(200, 220, 255); // Cor de fundo do cabeçalho
      doc.rect(startX, startY, larguraColuna, alturaLinha, 'FD'); // 'FD' é para preencher o retângulo com cor

      // Adiciona o texto do cabeçalho
      doc.setFont("helvetica", "bold"); // Fonte em negrito para o cabeçalho
      doc.setFontSize(10);
      const textoEmLinhas = doc.splitTextToSize(item.text, larguraColuna);
      doc.text(textoEmLinhas, startX + 2, startY + 5); // Adiciona um pequeno espaço dentro da célula

      startX += larguraColuna; // Move para a próxima coluna
    });

    // Atualiza a posição para a linha seguinte após o cabeçalho
    startY += alturaLinha;

    // Retorna o ponto (startX, startY) para a continuação da tabela
    return { startX, startY };
  }

  async adicionarLinhasTabela(doc, cabecalho, funcionarios, currentX, currentY) {
    const larguraTotal = doc.internal.pageSize.getWidth();
    const larguraPaginaPortatil = larguraTotal; // A largura será adaptada ao formato "Portátil"
    const tiposCabecalhoPercentual = 100; // Ajuste conforme a sua necessidade
    const alturaLinha = 10; // Ajuste a altura da linha conforme necessário
    let startX = currentX;
    let startY = currentY;

    const alturaPagina = doc.internal.pageSize.height; // Altura total da página (A5)
    const alturaRodape = 20; // Definir a altura do rodapé (ajuste conforme necessário)

    // Função para garantir que há espaço suficiente antes de adicionar uma nova linha
    const verificarQuebraPagina = async (doc, startY) => {
      if (startY + alturaLinha > alturaPagina - alturaRodape - 20) { // Menos 10mm para margens
        await this.adicionarRodape(doc, 40, alturaPagina - alturaRodape + 5, this.base64Image_rodape,false); // Adiciona o rodapé antes da quebra
        doc.addPage(); // Adiciona uma nova página
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

      cabecalho.forEach((item, index) => {
        const larguraColuna = (larguraPaginaPortatil * item.largura) / tiposCabecalhoPercentual;
        const valorCampo = funcionario[item.id]; // Acessa o valor do campo do funcionário baseado no id

        // Verifica se o valorCampo existe
        const texto = valorCampo ? valorCampo.toString() : Number((indexs + 1)).toString();

        // Desenha o retângulo para cada célula de dados
        doc.rect(startX, startY, larguraColuna, alturaLinha);

        // Adiciona o valor dentro da célula
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(texto.toUpperCase(), startX + 2, startY + 5); // Adiciona o texto dentro da célula

        startX += larguraColuna; // Move para a próxima coluna
      });

      startY += alturaLinha; // Move para a próxima linha
    }

    return startY

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
