import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'
export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    const dataNew_v2 = [
      {
        nome: 'FORMAÇÃO TÉCNICO POLICIAL',
        sigla: 'FTP',
        user_id: 2,
        activo: true,
        eliminado: false,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }, {
        nome: 'FORMAÇÃO ACADÊMICA',
        sigla: 'FA',
        user_id: 2,
        activo: true,
        eliminado: false,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }, {
        nome: 'OUTRAS FORMAÇÕES',
        sigla: 'OF',
        user_id: 2,
        activo: true,
        eliminado: false,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const iterator of dataNew_v2) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table("sigpq_tipo_formacao")
        .insert(iterator)
    }

    const resultados = await Promise.all([
      this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('FORMAÇÃO TÉCNICO POLICIAL'),
      this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('FORMAÇÃO ACADÊMICA'),
      this.atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao('OUTRAS FORMAÇÕES')
    ]);


  }

  async atualizarTabelaTipoCursoEspecificamenteOcampoTipoFormacao(tipo_formacao_nome: string) {
    const busca = tipo_formacao_nome
    const resultado = await Database
      .from("sigpq_tipo_formacao") // substitua 'sua_tabela' pelo nome da sua tabela
      .where('nome', 'LIKE', `%${busca}%`)
      .first();

    if (resultado) {
      const update = await Database
        .from("sigpq_tipo_cursos") // substitua 'this.#table' pelo nome da sua tabela
        .where('tipo', busca)
        .update({
          tipo_formacao_id: resultado.id
        });
    }
  }
}
