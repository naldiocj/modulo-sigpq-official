import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import CrudBaseRepositorios from '../../repositories/crud-base-repositorio';

const { ok } = require('App/Helper/Http-helper');
import { jsPDF } from "jspdf";
import Application from '@ioc:Adonis/Core/Application'


export default class Controller {
  #crud
  constructor() {
    this.#crud = new CrudBaseRepositorios()
  }

  public async pdf({ params, response }: HttpContextContract): Promise<any> {

    const { id } = params
    const data = new Date()
    console.log(params);
    // return

    const doc = new jsPDF({
      // orientation: "landscape",
      // unit: "in",
      // format: [4, 2]

    });
    doc.text("Hello world!", 10, 10);
    doc.text(`${data}`, 10, 20);
    doc.text(id, 10, 30);

    // Salve o PDF em um arquivo
    // const fileName = data
    const filePath = `app/@piips/files-mobilidade/${id}.pdf`
    doc.save(filePath);

    // response.header('Content-type', 'application/pdf')
    // return response.download(Application.publicPath('../'+filePath))
    // return response.download(filePath)

    return ok(null, 'Documento pronto para baixar!');
  }

  public async pdfIdividual({ response }: HttpContextContract): Promise<any> {
    const doc = new jsPDF({
      orientation: "landscape",
      // unit: "in",
      // format: [4, 2]

    });
    doc.text("Hello world!", 10, 10);

    // Salve o PDF em um arquivo
    const filePath = 'output.pdf'
    doc.save(filePath);


    response.header('Content-type', 'application/pdf')
    return response.download(filePath)
    return ok(null, 'Sucesso ao registar mobilidade!');
  }

}
