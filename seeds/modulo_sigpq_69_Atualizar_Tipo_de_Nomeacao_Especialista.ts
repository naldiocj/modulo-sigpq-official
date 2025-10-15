import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'

export default class extends BaseSeeder {

  public async run() {
    // Write your database queries inside the run method
    const resultados = await Promise.all([
      this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('Sem nomeação'),
    ]);

  }

  async atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao(tipo_formacao_nome: string) {
    const busca = tipo_formacao_nome
    const resultado = await Database
      .from("sigpq_acto_nomeacaos") // substitua 'sua_tabela' pelo nome da sua tabela
      .where('nome', 'LIKE', `%${busca}%`)
      .first();

    if (resultado) {
      const update = await Database
        .from("sigpq_acto_nomeacaos") // substitua 'this.#table' pelo nome da sua tabela
        .where('id', resultado.id)
        .update({
          nome: 'Especialista'
        });
    }
  }
}
