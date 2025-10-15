import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { jsPDF } from "jspdf";
import CrudLicencaRepository from '../../../config/licencas-para-funcionario/repositories/crud-repositorio';
import { logoInsignia, logoInsigniaMarcaDeAgua, logoRodaPe } from '../../../../../../app/@piips/shared/metodo-generico/helpers';
import CrudBasePessoaJuridicaRepository from '../../../config/tipo-pessoajuridica/repositories/crud-tipoPessoaJuridica-export';
import CrudBaseTipoLicencaRepository from '../../../config/tipo-licenca/repositories/crud-tipoLicenca-export';
import CrudBaseFuncionarioRepository from '../../../funcionario/repositories/crud-funcionario-export';
import { adicionarParteInferior, adicionarParteSuperior, adicionarRodape, escreverTextoComNegrito, escreverTextoJustificado, escreverTextoJustificado_v2, retorno_da_pagina } from './partes-de-documento';
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



      let pessoa_fisica = await this.#crudPessoaFisica.api.listarUm(input.pessoafisica_id)
      let comandante_do_orgao = await this.#crudPessoaJuridica.api.saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo({pessoajuridica_id:pessoa_fisica.sigpq_orgao.pessoajuridica_id})
      let funcao=pessoa_fisica.sigpq_funcao?.nome??'sem função'
      let doc = new jsPDF({
        orientation: "portrait",
        format: "a4" // Largura de 210 mm e altura de 170 mm  A5 tem 210 mm de largura e 148 mm de altura
    });

    const pageWidth = doc.internal.pageSize.getWidth();


      const local_Colocacao=`${pessoa_fisica.sigpq_tipo_orgao.nome_completo}`
      const direccao=`${local_Colocacao}`
      const nome=`${pessoa_fisica.nome_completo} ${pessoa_fisica.apelido??''}`
      const orgaoSigla=`${pessoa_fisica.sigpq_tipo_orgao.sigla}`
      const data=new Date()


  // Dimensões da imagem (em mm)


        const textDirecao = local_Colocacao.toUpperCase();
        adicionarParteSuperior(doc,textDirecao)

        doc.setFont("helvetica", "normal");
      doc.setFontSize(14);



        const formatar = (x) => {
          if (x > 9) {
              return x.toString(); // Converte o número para string
          } else {
              return `0${x}`; // Adiciona um zero à frente
          }
      };

        doc.text(`GUIA MÉDICA N.º    /${formatar(data.getMonth()+1)}/${data.getFullYear()} `, pageWidth / 2, 80, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);

        doc.text(`CENTRO MÉDICO PRINCIPAL DA POLÍCIA NACIONAL DE ANGOLA`, pageWidth / 2, 90, { align: "center" });

        doc.setFont("helvetica", "normal");

      const text = `
      NOME: ${nome}
      VÍNCULO JURÍDICO LABORAL: ${pessoa_fisica.patente_nome}
      COLOCAÇÃO: ${funcao} nesta Direcção
      SITUAÇÃO: Por manifestar sintomas de doença.
      `;

      const margin = 10;
      const maxWidth = pageWidth - 2 * margin; // Largura disponível no doc
      //await escreverTextoJustificado_v2(doc,text,95,maxWidth,false,8,5,5)
      await escreverTextoComNegrito(doc,`NOME: |**${nome}**|`,105,maxWidth,`VÍNCULO JURÍDICO LABORAL: ${pessoa_fisica.patente_nome}`,true,20)
      await escreverTextoComNegrito(doc,`COLOCAÇÃO: ${funcao} nesta Direcção`,118,maxWidth,`SITUAÇÃO: |**Por manifestar sintomas de doença.**|`,true,20)


      const ano_em_curso=data.getFullYear();
      const mes_em_curso=data.getMonth()+1;
      const dia_em_curso=data.getDate();

      let _text_comparecer = `Luanda, aos ${formatar(dia_em_curso)}/${formatar(mes_em_curso)} /${ano_em_curso}.`

      doc.setFont("helvetica", "normal");

       await escreverTextoJustificado(doc,_text_comparecer,140,maxWidth,true)//128

       let coordenada_x=138
       const cargo=comandante_do_orgao?.cargo_nome??'NÃO DEFINIDO'
       const cargo_categoria=comandante_do_orgao?.patente_nome??'NÃO DEFINIDO'
       const responsavel_cargo=comandante_do_orgao?.nome_completo??'NÃO DEFINIDO'
       let _text = `O
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
      doc.setFont("helvetica", "bold");
      _text_comparecer = `EXAME CLÍNICO`
      coordenada_x=coordenada_x+10
      await escreverTextoJustificado(doc,_text_comparecer.toUpperCase(),coordenada_x,maxWidth,true)
      coordenada_x=coordenada_x+2

      coordenada_x=await this.adicionarLinhas(doc,coordenada_x,6)

      _text_comparecer = `O MÉDICO`
      coordenada_x=coordenada_x+10
      await escreverTextoJustificado(doc,_text_comparecer.toUpperCase(),coordenada_x,maxWidth,true)
      coordenada_x=coordenada_x+2

      await this.adicionarLinhas(doc,coordenada_x,6)

      await adicionarRodape(doc, doc.internal.pageSize.width, doc.internal.pageSize.height,logoRodaPe,
        {
          nome_completo:pessoa_fisica.nome_completo,
          patente_nome:pessoa_fisica.patente_nome,
          colocacao:orgaoSigla,
          nome_do_documento:`GUIA MÉDICA`
        }
      );


       doc.setFontSize(13)
      //await adicionarParteInferior(doc,local_Colocacao,maxWidth,comandante_do_orgao,170)
      return retorno_da_pagina(doc,response)

    } catch (error) {
      console.error('Error generating doc:', error)
      response.status(500).send('Error generating doc')
    }

  }

  async adicionarLinhas(doc:any,coordenadaY:number,qtdLinhas:number=2)
  {
    let coordenadaY_v2=coordenadaY;
    for (let index = 0; index < qtdLinhas; index++) {

      doc.setLineWidth(1);
      const x1 = 10; // Coordenada X do ponto inicial
      const y1 = coordenadaY_v2; // Coordenada Y do ponto inicial
      const x2 = 200; // Coordenada X do ponto final
      const y2 = coordenadaY_v2; // Coordenada Y do ponto final
      // Define a cor e a largura da linha (opcional)
      doc.setLineWidth(0.5); // Largura da linha

      // Desenha a linha
      doc.line(x1, y1, x2, y2);
      coordenadaY_v2=coordenadaY_v2+6

    }

    return coordenadaY_v2;

  }












}
