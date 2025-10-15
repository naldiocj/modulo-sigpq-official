import Database from '@ioc:Adonis/Lucid/Database';
import DocumentoCrudBaseRepository from '../../documento/repositories/crud-base-repositorio';

export default class VerRepository {

  #documentoRepo
  constructor() {
    this.#documentoRepo = new DocumentoCrudBaseRepository()
  }

  public async listarUm(id: any): Promise<any> {

    try {

      let query = Database.from({ f: 'sigpq_funcionarios' })
        .select(
          'pessoas.nome_completo',
          'pessoas.email_pessoal',
          'pessoas.user_id',
          'pessoas.activo',
          'pessoafisicas.foto_civil',
          'pessoafisicas.apelido',
          'pessoafisicas.genero',
          'pessoafisicas.nome_pai',
          'pessoafisicas.nome_mae',
          'pessoafisicas.estado',
          'pessoafisicas.nacionalidade_id',
          'estado_civils.nome as estado_civil_nome',
          'f.nip',
          'f.numero_processo',
          'f.numero_agente',
          'f.foto_efectivo',
          'f.descricao',
          'f.pseudonimo',
          'f.id',
          'patentes.nome as patente_nome',
          'patentes.classe as patente_classe',
          'pais.nome as naturalidade',
          'regimes.nome as regime_nome',
          'regimes.quadro as regime_quadro',
          'sigpq_tipo_vinculos.nome as sigpq_tipo_vinculo_nome',
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw("DATE_FORMAT(pessoafisicas.data_nascimento, '%d/%m/%Y') as data_nascimento"),
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('pessoas', 'pessoas.id', 'f.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'f.id')
        .innerJoin('regimes', 'regimes.id', 'pessoafisicas.regime_id')
        .innerJoin('pais', 'pais.id', 'pessoafisicas.nacionalidade_id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('sigpq_tipo_vinculos', 'sigpq_tipo_vinculos.id', 'f.sigpq_tipo_vinculo_id')
        .innerJoin('estado_civils', 'estado_civils.id', 'pessoafisicas.estado_civil_id')
        .where('sigpq_provimentos.activo', true)
        .where('pessoas.eliminado', false)
        .where('f.id', id)
        .first()

      const response = await query;
      const documento = await this.#documentoRepo.findByOne([{ field: 'pessoafisica_id', value: response.id }]);

      return new Promise((resolve) => {
        setTimeout(() => {
          const item = {
            ...response,
            documento
          };
          resolve(item);
        }, 2000);
      })

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
