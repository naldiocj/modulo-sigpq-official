import Database from '@ioc:Adonis/Lucid/Database';
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table = "sigpq_tipo_documentos";
  public async run() {
    
    await Database.from(this.#table).where('sigla', 'CH').update({
      nome: 'Certificado de Habilitações'
    })
    await Database.from(this.#table).where('sigla', 'CV').update({
      nome: 'Currículum Vitae'
    })

    await Database.from(this.#table).where('sigla', 'DI').update({
      nome: ' Despacho de Interinação'
    })
    await Database.from(this.#table).where('sigla', 'CC').update({
      nome: ' Carta de Condução'
    })


  }
}
