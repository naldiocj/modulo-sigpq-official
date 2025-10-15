import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'

export default class extends BaseSeeder {

  public async run() {
    // Write your database queries inside the run method

    const resultados = await Promise.all([
      this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('Técnica Superior', 'Técnico Superior'),
      this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('Técnica', 'Técnico'),
      this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('Técnica Média', 'Técnico Médio'),
      this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('Administrativa', 'Administrativo'),
    ]);

  }

  async atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao(tipo_formacao_nome: string, novo_nome: string) {
    const busca = tipo_formacao_nome
    const resultado = await Database
      .from("patentes") // substitua 'sua_tabela' pelo nome da sua tabela
      .where('classe', 'LIKE', `${busca}`)
      .update({
        classe: novo_nome
      });
  }
}
