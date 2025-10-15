
import Database from '@ioc:Adonis/Lucid/Database';

// import NotCreatedException from 'App/Exceptions/NotCreatedException';

import sigpqHabilitacaoLiterariaRepo from '../../habilitacao-literaria/repositories/listar-habilitacao-literaria-repositorio';
import EnderecoRepo from '../../endereco/repositories/listar-endereco-repositorio';
import ContactoRepo from '../../contacto/repositories/listar-contacto-repositorio';
import CrudBaseRepository from '../../mobilidade/repositories/crud-base-repositorio';


export default class BaseRepositorio {

  #sigpqHabilitacaoLiterariaRepo: any

  #sigpqEnderecoRepo: any
  #sigpqContactoRepo: any
  #sigpqMobilidade: CrudBaseRepository

  constructor() {

    this.#sigpqHabilitacaoLiterariaRepo = new sigpqHabilitacaoLiterariaRepo()
    this.#sigpqEnderecoRepo = new EnderecoRepo();
    this.#sigpqContactoRepo = new ContactoRepo();
    this.#sigpqMobilidade = new CrudBaseRepository()

  }
  public async execute(id: any): Promise<any> {

    try {

      let query = Database.from({ f: 'sigpq_funcionarios' })
        .select(
          'p.nome_completo',
          'p.email_pessoal',
          'p.user_id',
          'p.activo',
          'pf.apelido',
          'pf.genero',
          'pf.nome_pai',
          'pf.nome_mae',
          'pf.nacionalidade_id',
          'pf.local_nascimento',
          'pf.iban',
          // 'pf.estado',
          'pf.foto_civil',
          'f.sigpq_tipo_sanguineo_id',
          'sigpq_tipo_sanguineos.nome as tipo_sanguineo',
          'estado_civils.nome as estado_civil_nome',
          'estado_civils.id as estado_civil_id',
          'f.nip',
          'f.numero_processo',
          'f.numero_agente',
          'f.foto_efectivo',
          'f.descricao',
          'f.pseudonimo',
          'f.id',
          'patentes.nome as patente_nome',
          'patentes.classe as patente_classe',
          'patentes.id as patente_id',
          'pais.nome as nacionalidade',
          'pf.naturalidade_id',
          'n.nome as naturalidade',
          'pais.id as naturalidade_id',
          'regimes.nome as regime_nome',
          'regimes.quadro as regime_quadro',
          'regimes.id as regime_id',
          'se.nome as estado',
          'sigpq_tipo_vinculos.nome as sigpq_tipo_vinculo_nome',
          'sigpq_tipo_vinculos.id as sigpq_tipo_vinculo_id',
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw("DATE_FORMAT(pf.data_nascimento, '%d/%m/%Y') as data_nascimento"),
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('pessoas as p', 'p.id', 'f.id')
        .innerJoin('pessoafisicas as pf', 'pf.id', 'f.id')
        .innerJoin('regimes', 'regimes.id', 'pf.regime_id')
        .innerJoin('pais', 'pais.id', 'pf.nacionalidade_id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'p.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('sigpq_tipo_vinculos', 'sigpq_tipo_vinculos.id', 'f.sigpq_tipo_vinculo_id')
        .innerJoin('sigpq_tipo_sanguineos', 'sigpq_tipo_sanguineos.id', 'f.sigpq_tipo_sanguineo_id')
        .leftJoin('estado_civils', 'estado_civils.id', 'pf.estado_civil_id')
        .leftJoin('provincias as n', 'n.id', 'pf.naturalidade_id')
        .leftJoin('sigpq_funcionario_estados as fe', 'fe.pessoafisica_id', 'f.id')
        .leftJoin('sigpq_situacao_estados as se', 'se.id', 'fe.sigpq_situacao_id')
        .leftJoin('sigpq_estados as es', 'es.id', 'fe.sigpq_estado_id')
        .where('sigpq_provimentos.activo', true)
        .where('p.eliminado', false)
        .where('f.id', id)
        .first()

      const resp = await query;

      if (!resp) {
        return Error('Agente não econtrado.');
      }

      const sigpq_carta_conducao = await Database.from({ f: 'sigpq_documentos' })
        .select(
          'id',
          'nid',
          'data_emissao',
          'data_expira'
        )
        .where('f.pessoafisica_id', resp.id)
        .where('f.eliminado', false)
        .where('f.sigpq_tipo_documento_id', 2)
        .first()

      const sigpq_passaporte = await Database.from({ f: 'sigpq_documentos' })
        .select(
          'id',
          'nid',
          'data_emissao',
          Database.raw("DATE_FORMAT(data_expira, '%d/%m/%Y ') as data_expira"),
        )
        .where('f.pessoafisica_id', resp.id)
        .where('f.eliminado', false)
        .where('f.sigpq_tipo_documento_id', 4)
        .first()

      const sigpq_habilitacao_literaria = await Database.from({ h: 'sigpq_habilitacaoliterarias' })
        .select(
          'h.*',
          Database.raw("DATE_FORMAT(h.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(h.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
          'th.nome as habilitacao_literaria',
          'th.id as sigpq_tipo_habilitacaoliteraria_id')
        .leftJoin('sigpq_tipo_habilitacaoliterarias as th', 'th.id', 'h.sigpq_tipo_habilitacaoliteraria_id')
        .where('h.pessoafisica_id', resp.id)
        .where('h.eliminado', false)
        .where('h.activo', true).first()



      this.#sigpqHabilitacaoLiterariaRepo.findByOne([
        { field: 'pessoafisica_id', value: resp.id }
      ]);

      const sigpq_endereco = await this.#sigpqEnderecoRepo.findByOne([
        { field: 'pessoa_id', value: resp.id }
      ]);

      const sigpq_contacto_pessoal = await this.#sigpqContactoRepo.findByOne([
        { field: 'pessoa_id', value: resp.id },
        { field: 'activo', value: true },
        { field: 'descricao', value: 'Telefone' }
      ]);
      const sigpq_contacto_alternativo = await this.#sigpqContactoRepo.findByOne([
        { field: 'pessoa_id', value: resp.id },
        { field: 'activo', value: true },
        { field: 'descricao', value: 'Telefone alternativo' }
      ]);
      const sigpq_contacto_profissional = await this.#sigpqContactoRepo.findByOne([
        { field: 'pessoa_id', value: resp.id },
        { field: 'activo', value: true },
        { field: 'descricao', value: 'Telefone de serviço' }
      ]);

      const sigpq_mobilidade = await this.#sigpqMobilidade.listarTodosPorPessoa({ pessofisica_id: resp.id })


      const sigpq_orgao = await Database.from({ f: 'sigpq_funcionario_orgaos' })
        .select(
          '*',
          Database.raw("DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .where('pessoafisica_id', resp.id)
        .where('nivel_colocacao', 'muito-alto')
        .where('activo', true)
        .first()

      const sigpq_tipo_orgao = await Database.from({ p: 'pessoas' })
        .select(
          '*',
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'p.id')
        .where('p.id', sigpq_orgao.pessoajuridica_id)
        .first()

      const sigpq_curso = await Database.from({ c: 'sigpq_cursos' })
        .select(
          '*',
          'tc.nome',
          'tc.id as sigpq_tipo_curso_id',
          Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .leftJoin('sigpq_tipo_cursos as tc', 'tc.id', 'c.sigpq_tipo_curso_id')
        .where('c.pessoafisica_id', resp.id)
        .where('c.activo', true)
        .where('c.eliminado', false)
        .first()

      const sigpq_cargo = await Database.from({ c: 'sigpq_cargos' })
        .select(
          'c.id',
          'c.situacao',
          'c.pessoafisica_id',
          'c.pessoajuridica_id',
          'tc.id as sigpq_tipo_cargo_id',
          'tc.nome',
          'c.activo',
          Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('sigpq_tipo_cargos as tc', 'tc.id', 'c.sigpq_tipo_cargo_id')
        .where('c.pessoafisica_id', resp.id)
        .where('c.activo', true)
        .where('c.eliminado', false)
        .first()

      const sigpq_funcao = await Database.from({ f: 'sigpq_funcaos' })
        .select('f.id',
          'f.situacao',
          'f.pessoafisica_id',
          'f.pessoajuridica_id',
          'pj.sigla as sigla_orgao',
          'p.nome_completo as orgao',
          'tf.id as sigpq_tipo_funcao_id',
          'tf.nome',
          'pj.orgao_comando_provincial',
          'f.activo',
          'f.observacao',

          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .innerJoin('sigpq_tipo_funcaos as tf', 'tf.id', 'f.sigpq_tipo_funcao_id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'f.pessoajuridica_id')
        .innerJoin('pessoas as p', 'p.id', 'pj.id')
        // .sigpq_tipo_funcaos
        .where('f.eliminado', false)
        .where('f.pessoafisica_id', resp.id)
        // .where('activo', true)
        .where('f.eliminado', false).first()

      const sigpq_categoria = await Database.from({ c: 'sigpq_carreiras' })
        .select(
          'c.*',
          'tc.nome',
          'tc.id as sigpq_tipo_carreira_id',

          Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .leftJoin('sigpq_tipo_carreiras as tc', 'tc.id', 'c.sigpq_tipo_carreira_id')
        .where('c.pessoafisica_id', resp.id)
        .where('c.activo', true)
        .where('c.eliminado', false)
        .first()


      const sigpq_provimento = await Database.from({ p: 'sigpq_provimentos' })
        .select('p.activo',
          'p.numero_despacho',
          Database.raw("DATE_FORMAT(p.data_provimento, '%d/%m/%Y') as data_provimento"),
          'sigpq_acto_progressaos.nome as sigpq_acto_progressaos_nome',
          'patentes.nome as patente_nome',
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")

        )
        .innerJoin('patentes', 'patentes.id', 'p.patente_id')
        .leftJoin('sigpq_acto_progressaos', 'sigpq_acto_progressaos.id', 'p.acto_progressao_id')
        .where('pessoa_id', resp.id)
        .where('p.eliminado', false)
      // .first()

      const sigpq_familiars = await Database.from({ f: 'sigpq_familiars' })
        .select(
          '*',
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .where('f.pessoafisica_id', resp.id)
        .where('f.eliminado', false)
        .clone()

      const sigpq_documentos = await Database.from({ f: 'sigpq_documentos' })
        .select(
          '*',
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
          Database.raw("DATE_FORMAT(f.data_emissao, '%d/%m/%Y ') as data_emissao"),
          Database.raw("DATE_FORMAT(f.data_expira, '%d/%m/%Y ') as data_expira")
        )
        .where('f.pessoafisica_id', resp.id)
        .where('f.eliminado', false)
        .clone().first()

      const utilizador = await Database.from({ u: 'users' })
        .select(
          'u.email',
          Database.raw("DATE_FORMAT(u.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(u.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        ).where('u.pessoa_id', resp.id)
        .where('u.eliminado', false)
        .clone().first()
      // const urlFile = await getFile(resp.foto_efectivo, true)
      // console.log(response.download(urlFile) || null);

      return {
        ...resp,
        sigpq_habilitacao_literaria,
        sigpq_endereco,
        sigpq_contacto_profissional,
        sigpq_contacto_pessoal,
        sigpq_contacto_alternativo,
        sigpq_orgao,
        sigpq_tipo_orgao,
        sigpq_curso,
        sigpq_cargo,
        sigpq_funcao,
        sigpq_categoria,
        sigpq_provimento,
        sigpq_familiars,
        sigpq_documentos,
        sigpq_mobilidade,
        utilizador,

        // foto_efectivo: null,
        // foto_efectivo: resp.foto_efectivo,
        sigpq_carta_conducao,
        sigpq_passaporte
      }


    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }
}
