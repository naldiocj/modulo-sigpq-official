import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { jsPDF } from "jspdf";
import CrudLicencaRepository from '../../../config/licencas-para-funcionario/repositories/crud-repositorio';
import CrudBasePessoaJuridicaRepository from '../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export';
import CrudBaseTipoLicencaRepository from '../../../config/tipo-licenca/repositories/crud-tipoLicenca-export';
import CrudBaseFuncionarioRepository from '../../../funcionario/repositories/crud-funcionario-export';
import { adicionarParteInferior, adicionarParteSuperior, adicionarRodape, escreverTextoJustificado, escreverTextoJustificado_v2, retorno_da_pagina } from './partes-de-documento';
const fs = require('fs');

const removeTextNullVariable = require('App/@piips/shared/metodo-generico/RemoveTextNullVariable')

const { ok } = require('App/Helper/Http-helper')

export default class Controller {
  #licenca
  base64Image_rodape:any
  #crudPessoaJuridica:CrudBasePessoaJuridicaRepository;
  #crudPessoaFisica:CrudBaseFuncionarioRepository;
  #tipoLicenca
  data = new Date()
  constructor() {
    this.#licenca = new CrudLicencaRepository()
    this.#crudPessoaJuridica = new CrudBasePessoaJuridicaRepository()
    this.#crudPessoaFisica = new CrudBaseFuncionarioRepository()
    this.#tipoLicenca=new CrudBaseTipoLicencaRepository()
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

      let comandante_do_orgao = await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo({pessoajuridica_id:input.pessoajuridica_id})
      let pessoa_fisica = await this.#crudPessoaFisica.api.listarUm(input.pessoafisica_id)
      let tipoLicenca = await this.#tipoLicenca.api.listarTodos({tipo_licenca:input.tipo_licenca_id})


      let filtro;
        if(!(input.licenca_disciplinar))filtro= {tipo_licenca_id:input.tipo_licenca_id,pessoafisica_id:input.pessoafisica_id,ano:input.ano,mes:input.mes}
        else filtro= {tipo_licenca_id:input.tipo_licenca_id,pessoafisica_id:input.pessoafisica_id,ano:input.ano}
      let licencas= await this.#licenca.saberDiasDeFerias(filtro);
      const licenca=tipoLicenca[0].nome
      const quantidade_Dias=licencas.length
      const temDireitoAMaisDiasPeloSeuServico:boolean=(licenca=='DISCIPLINAR' && quantidade_Dias>22)
      let doc = new jsPDF({
        orientation: "landscape",
        format: [temDireitoAMaisDiasPeloSeuServico?250:210, 210] // Largura de 210 mm e altura de 170 mm  A5 tem 210 mm de largura e 148 mm de altura
    });

   
    const pageWidth = doc.internal.pageSize.getWidth();
    if(licencas.length==0)
    {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);

      doc.text(`De momento não há dia aprovado para gerar o documento`, pageWidth / 2, 74, { align: "center" });
      return retorno_da_pagina(doc,response)

    }

    
      const local_Colocacao=`${pessoa_fisica.sigpq_tipo_orgao.nome_completo}`
      const direccao=`${local_Colocacao}`
      const nome=`${pessoa_fisica.patente_nome} - ${pessoa_fisica.nome_completo}`
      const dia_retorno=await this.formatDateToExtenso(licencas[quantidade_Dias-1].dia_selecionado)
      const dia_inicio=await this.formatDateToExtenso(licencas[0].dia_selecionado)
      
      const orgaoSigla=`${pessoa_fisica.sigpq_tipo_orgao.sigla}`
      const data=new Date()
      const ano_em_curso=data.getFullYear();

    //console.log(pessoa_fisica.data_adesao.split('/')[2])
  /////// Dimensões da imagem (em mm)


        const textDirecao = local_Colocacao.toUpperCase();
        adicionarParteSuperior(doc,textDirecao)

        doc.setFont("helvetica", "bold");
      doc.setFontSize(14);

      //doc.text(`LICENÇA ${licenca} Nº      /${orgaoSigla}/PNA/${ano_em_curso}`, pageWidth / 2, 74, { align: "center" });
      doc.text(`LICENÇA ${licenca}`, pageWidth / 2, 68, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);

      let text:any
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin; // Largura disponível no PDF
     if(temDireitoAMaisDiasPeloSeuServico) 
      {
        text = `
      Tem direito  a ${Math.min(quantidade_Dias, 22)} dias úteis, com início no dia ${dia_inicio}, o  ${nome}
      afecto à este Órgão, a qual lhe foi concedido gozar em território nacional.
      `;

      
      await escreverTextoJustificado_v2(doc,text,80,maxWidth,false,8,5,5)
        const dias=quantidade_Dias-22

        const plural = dias > 1 ? 'dias úteis' : 'dia útil';
      const verbo = dias > 1 ? 'Nota: Foram acrescidos' : 'Nota: Foi acrescido';

      text = `
        ${verbo} ${this.numeroPorExtenso(dias)} ${plural}, pelos ${await this.calcularTempoDeServico(pessoa_fisica.data_adesao)??'S/D'} anos de serviço efectivos, prestados desde ${pessoa_fisica.data_adesao.split('/')[2]??'S/D'}, nos termos do n.º 2 do artigo 79.º de Decreto-Lei 26/22 de 22 de Agosto. Devendo apresentar-se às 8 horas do dia ${dia_retorno}.
      `;
      
      await escreverTextoJustificado_v2(doc,text,100,maxWidth,false,8,5,5)

      } else 
      {
        text = `  
        Tem direito  a ${quantidade_Dias} dias úteis, com início no dia ${dia_inicio}, o  ${nome}
        afecto à este Órgão, a qual lhe foi concedido gozar em território nacional, devendo apresentar-se às 8 horas do dia ${dia_retorno}.
        `;
        await escreverTextoJustificado_v2(doc,text,80,maxWidth,false,8,5,5)
        
      } 


     

  /* let _text = `
      Obs. A presente licença decorre de um direito do funcionário previsto no nº 1 do Art.77 ª conjunto com o nº 1 e 2 do Art.79.º da Lein. ª 26/22, de 22 de Agosto.
      `; */
       let _text_comparecer = `Obs: Deve comparecer nos Tribunais e Órgão de Justiça, sempre que for ${
        pessoa_fisica.genero == 'M' ? 'intimado ou requisitado' : 'intimada ou requisitada'
      }.`; 
      doc.setFontSize(13) 
       await escreverTextoJustificado_v2(doc,_text_comparecer,temDireitoAMaisDiasPeloSeuServico?130:115,maxWidth,false,8,5,5)

       doc.setFontSize(13)
       
      await adicionarParteInferior(doc,local_Colocacao,maxWidth,comandante_do_orgao,134,
        {
          nome_completo:pessoa_fisica.nome_completo,
          patente_nome:pessoa_fisica.patente_nome,
          colocacao:orgaoSigla,
          nome_do_documento:`LICENÇA ${licenca}`
        }
      )
      return retorno_da_pagina(doc,response)

    } catch (error) {
      console.error('Error generating PDF:', error)
      response.status(500).send('Error generating PDF')
    }

  }

   numeroPorExtenso(numero: number): string {
    const numerosExtenso: Record<number, string> = {
        1: 'um',
        2: 'dois',
        3: 'três',
        4: 'quatro',
        5: 'cinco',
        6: 'seis',
        7: 'sete',
        8: 'oito',
        9: 'nove',
        10: 'dez',
        11: 'onze',
        12: 'doze',
        13: 'treze',
        14: 'catorze',
        15: 'quinze',
        16: 'dezasseis',
        17: 'dezassete',
        18: 'dezoito',
        19: 'dezanove',
        20: 'vinte',
        21: 'vinte e um',
        22: 'vinte e dois',
        23: 'vinte e três',
        24: 'vinte e quatro',
        25: 'vinte e cinco',
        26: 'vinte e seis',
        27: 'vinte e sete',
        28: 'vinte e oito',
        29: 'vinte e nove',
        30: 'trinta'
    };

    if (numero >= 1 && numero <= 30) {
        return numerosExtenso[numero];
    } else {
        return "Número fora do intervalo (1-30)";
    }

    
}




async calcularTempoDeServico(dataAdesao: string): Promise<string> {
  // Dividindo a data pela barra para obter o dia, mês e ano
  const [dia, mes, ano] = dataAdesao.split('/').map(Number);

  // Criando um objeto Date com a data de adesão
  const dataInicio = new Date(ano, mes - 1, dia); // mes - 1 porque os meses começam do 0
  const dataAtual = new Date();

  // Verifica se a data de adesão é válida
  if (isNaN(dataInicio.getTime())) {
    return "Data de adesão inválida.";
  }

  // Calculando a diferença em anos, meses e dias
  let anos = dataAtual.getFullYear() - dataInicio.getFullYear();
  let meses = dataAtual.getMonth() - dataInicio.getMonth();
  let dias = dataAtual.getDate() - dataInicio.getDate();

  // Ajustando os valores se a diferença de meses ou dias não for válida
  if (dias < 0) {
    meses--;
    const ultimoDiaDoMesAnterior = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 0).getDate();
    dias += ultimoDiaDoMesAnterior;
  }

  if (meses < 0) {
    anos--;
    meses += 12;
  }

  return this.numeroPorExtenso(anos);
  return `${anos}`;
  return `${anos} anos, ${meses} meses e ${dias} dias`;
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
