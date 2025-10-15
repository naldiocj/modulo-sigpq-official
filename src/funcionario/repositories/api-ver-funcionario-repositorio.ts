import Database from '@ioc:Adonis/Lucid/Database';

export default class ApiVerFuncionarioRepository {

  public async ver(id: any): Promise<any> {

    try {

      let query = Database.from({ f: 'sigpq_funcionarios' })
        .select(
          'pessoas.nome_completo',
          'pessoas.user_id',
          'pessoas.activo',
          'pessoafisicas.apelido',
          'pessoafisicas.genero',
          'pessoafisicas.nome_pai',
          'pessoafisicas.nome_mae',
          'pessoafisicas.nacionalidade_id',
          'pessoafisicas.estado_civil_id',
          'pais.nome as pais_nome',
          'pais.nacionalidade as nacionalidade',
          'patentes.nome as patente_nome',
          'estado_civils.nome as estado_civil_nome',
          'f.nip',
          'f.numero_processo',
          'f.numero_agente',
          'f.foto_efectivo',
          'f.descricao',
          'f.id',
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw("DATE_FORMAT(pessoafisicas.data_nascimento, '%d/%m/%Y') as data_nascimento"),
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")

        )
        .innerJoin('pessoas', 'pessoas.id', 'f.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'f.id')
        .innerJoin('pais', 'pais.id', 'pessoafisicas.nacionalidade_id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('estado_civils', 'estado_civils.id', 'pessoafisicas.estado_civil_id')
        .where('f.nip', id)
        .where('sigpq_provimentos.activo', true)
        .where('pessoas.eliminado', false)
        .first()

      return await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
