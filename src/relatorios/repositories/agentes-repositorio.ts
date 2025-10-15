import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';

// import NotCreatedException from 'App/Exceptions/NotCreatedException';

import CrudDocumentoBaseRepository from '../../documento/repositories/crud-base-repositorio';
// import DocumentoCrudBaseRepository from '../../documento/repositories/crud-base-repositorio';
import OrgaoCrudBaseRepository from './../../config/direcao-ou-orgao/repositories/crud-base-repositorio';
import sigpqHabilitacaoLiterariaRepo from './../../habilitacao-literaria/repositories/listar-habilitacao-literaria-repositorio';
import EnderecoRepo from './../../endereco/repositories/listar-endereco-repositorio';
import ContactoRepo from './../../contacto/repositories/listar-contacto-repositorio';
//import AgenteOrgaoRepo from './../../agente-orgao/repositories/listar-agente-orgao-repositorio';

import NumeroAutomaticoService from 'App/@piips/shared/service/NumeroAutomaticoService';


export default class AgenteRepository {

  dateTime = new Date()
  #table = "sigpq_funcionarios"

  #crudDocumentoBaseRepository: any
  // #documentoRepo: any
  #sigpqHabilitacaoLiterariaRepo: any
  #numeroAutomaticoService: any
  #orgaoCrudBaseRepository: any
  #sigpqEnderecoRepo: any
  #sigpqContactoRepo: any

  constructor() {
    // this.#documentoRepo = new DocumentoCrudBaseRepository()
    this.#crudDocumentoBaseRepository = new CrudDocumentoBaseRepository()
    this.#orgaoCrudBaseRepository = new OrgaoCrudBaseRepository();
    this.#sigpqHabilitacaoLiterariaRepo = new sigpqHabilitacaoLiterariaRepo()
    this.#numeroAutomaticoService = new NumeroAutomaticoService();
    this.#sigpqEnderecoRepo = new EnderecoRepo();
    this.#sigpqContactoRepo = new ContactoRepo();
    //this.#agenteOrgaoRepo = new AgenteOrgaoRepo();
    // this.#loggerRepository = new LoggerRepository();
  }


  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ f: 'sigpq_funcionarios' })
        .select(
          // ...options.valoresSelecionados,
          'p.nome_completo',
          'p.activo',
          'pj.sigla',
          // Database.raw(`CASE WHEN p.activo = 1 THEN 'sim' ELSE false END as activo`),
          'pf.apelido',
          'pf.genero',
          'pf.estado',
          'f.nip',
          'f.numero_processo',
          'f.numero_agente',
          'f.foto_efectivo',
          'f.id',
          'patentes.nome as patente_nome',
          Database.raw("CONCAT(p.nome_completo, ' ', pf.apelido) as nome_completo_apelido"),
          Database.raw("DATE_FORMAT(pf.data_nascimento, '%d/%m/%Y') as data_nascimento"),
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('pessoas as p', 'p.id', 'f.id')
        .innerJoin('pessoafisicas as pf', 'pf.id', 'f.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'p.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'p.id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'sigpq_funcionario_orgaos.pessoajuridica_id')
        // .innerJoin('sigpq_funcionario_orgaos as fo', 'fo.pessoafisica_id', 'p.id')
        .where('sigpq_provimentos.activo', true)

        .where('sigpq_provimentos.eliminado', false)
        .where('sigpq_funcionario_orgaos.activo', true)
        .where('sigpq_funcionario_orgaos.eliminado', false)

        // .where('f.sigpq_tipo_vinculo_id', 1) // efectivo
        // .where('fo.pessoajuridica_id', 1)
        .where('p.eliminado', false)
        .orderBy('p.nome_completo', 'asc')


      if (!options.user.aceder_todos_agentes) {
        query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
      }

      if (options.pessoaEstadoId) {
        query.where('pf.estado', options.pessoaEstadoId)
      }

      if (options.regimeId) {
        query.where('pf.regime_id', Number(options.regimeId))
      }

      if (options.patenteId) {
        query.where('patentes.id', Number(options.patenteId))
      }

      if (options.tipoVinculoId) {
        query.where('f.sigpq_tipo_vinculo_id', Number(options.tipoVinculoId))
      }

      if (options.tipoOrgaoId) {
        query.whereLike('pj.orgao_comando_provincial', options.tipoOrgaoId)
      }

      // if (options.aceder_todos_agentes) {
      if (options.orgaoId) {
        query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgaoId)
      } else {
        // query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
      }

      if (options.genero) {
        query.where('pf.genero', options.genero)
      }

      if (options.patenteClasse) {
        query.where('patentes.classe', options.patenteClasse)
      }

      query.where(function (item: any): void {

        // if (options.search) {
        //   item.orWhere('p.nome_completo', 'like', `%${options.search}%`)
        //   item.orWhere('pf.apelido', 'like', `%${options.search}%`)
        //   item.orWhere('f.nip', 'like', `%${options.search}%`)
        //   item.orWhere('f.numero_processo', 'like', `%${options.search}%`)
        //   item.orWhere('f.numero_agente', 'like', `%${options.search}%`)
        //   item.orWhereRaw("concat(p.nome_completo, ' ',pf.apelido) like ?", `%${options.search}%`)
        //   // item.orWhere('pj.sigla', 'like', `%${options.search}%`)

        //   const date = new Date(options.search);
        //   if (!isNaN(date.getTime())) {
        //     const [day, month, year] = options.search.split('/');

        //     let data = ""
        //     if (day && month && year) {
        //       data = `${year}-${month}-${day}`
        //     } else if (day && month) {
        //       data = `${month}-${day}`
        //     } else {
        //       data = day
        //     }
        //     item.orWhere('p.created_at', 'like', `%${data}%`)
        //   }
        // }
      })


      return await query
      if (options.page) {
        const pagination = await query.paginate(options.page, options.perPage || 10);
        pagination['rows'] = await Promise.all(pagination['rows'].map(async (item: any) => {
          return {
            ...item,
            // documento: await this.#documentoRepo.findByOne([{ field: 'pessoafisica_id', value: item.id }]),
            orgao: await this.#orgaoCrudBaseRepository.listarPorPessoa(item.id) || null
          };
        }));

        return pagination;
      } else {
        const items = await query;
        const all = await Promise.all(items.map(async (item: any) => {
          return {
            ...item,
            // documento: await this.#documentoRepo.findByOne([{ field: 'pessoafisica_id', value: item.id }]),
            orgao: await this.#orgaoCrudBaseRepository.listarPorPessoa(item.id)
          };
        }));
        return all;
      }

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async listar(id: any, response: any = null): Promise<any> {

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
          'pf.naturalidade_id',
          'pf.local_nascimento',
          'pf.iban',
          'pf.estado',
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
          'patentes.id as patente_id',
          'pais.nome as naturalidade',
          'pais.id as pais_id',
          'regimes.nome as regime_nome',
          'regimes.id as regime_id',
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
        .where('sigpq_provimentos.activo', true)
        .where('p.eliminado', false)
        .where('f.id', id)
        .first()

      const resp = await query;

      if (!resp) {
        return Error('Agente não econtrado.');
      }

      const sigpq_habilitacao_literaria = await this.#sigpqHabilitacaoLiterariaRepo.findByOne([
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

      const sigpq_orgao = await Database.from({ f: 'sigpq_funcionario_orgaos' })
        .select(
          '*',
          Database.raw("DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .where('pessoafisica_id', resp.id)
        .where('activo', true)
        .where('eliminado', false)
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
          Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .where('c.pessoafisica_id', resp.id)
        .where('activo', true)
        .where('eliminado', false)
        .first()

      const sigpq_cargo = await Database.from({ c: 'sigpq_cargos' })
        .select(
          '*',
          Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .where('c.pessoafisica_id', resp.id)
        .where('activo', true)
        .where('eliminado', false)
        .first()

      const sigpq_funcao = await Database.from({ f: 'sigpq_funcaos' })
        .select('*',
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
        )
        .innerJoin('sigpq_tipo_funcaos as tf', 'tf.id', 'f.sigpq_tipo_funcao_id')
        // .innerJoin('pessoajuridicas as pj', 'pj.id', 'f.pessoajuridica_id')
        // .innerJoin('pessoas as p', 'p.id', 'pj.id')
        // .sigpq_tipo_funcaos
        .where('f.eliminado', false)
        .where('f.pessoafisica_id', resp.id)
        .where('f.activo', true)
        .where('f.situacao', 'actual')
        .where('f.  eliminado', false)
        .first()

      const sigpq_categoria = await Database.from({ c: 'sigpq_carreiras' })
        .select(
          '*',
          Database.raw("DATE_FORMAT(c.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(c.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .where('c.pessoafisica_id', resp.id)
        .where('activo', true)
        .where('eliminado', false)
        .first()

      const sigpq_provimento = await Database.from({ p: 'sigpq_provimentos' })
        .select('p.*', 'patentes.*', 'patentes.nome as patente', 'sigpq_acto_progressaos.*',
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('patentes', 'patentes.id', 'p.patente_id')
        .leftJoin('sigpq_acto_progressaos', 'sigpq_acto_progressaos.id', 'p.acto_progressao_id')
        .where('pessoa_id', resp.id)
        .where('p.eliminado', false)
        .where('p.activo', true)
        .where('p.situacao', 'actual')
        .first()

      const sigpq_funcionario_orgao = await Database.from({ fo: 'sigpq_funcionario_orgaos' })
        .select(
          // 'fo.id',
          // 'fo.activo',
          // 'fo.user_id',
          // 'fo.pessoafisica_id',
          // 'fo.pessoajuridica_id',
          // 'fo.numero_guia',
          // 'fo.despacho',
          // 'fo.observacao',
          // 'pessoas.nome_completo',
          '*',
          Database.raw("DATE_FORMAT(fo.data_ingresso, '%d/%m/%Y') as data_ingresso"),
          Database.raw("DATE_FORMAT(fo.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(fo.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('pessoas', 'pessoas.id', 'fo.pessoajuridica_id')
        .where('fo.pessoafisica_id', resp.id)
        .where('fo.eliminado', false)
        .orderBy('fo.created_at', 'desc')
        .first()

      const sigpq_familiars = await Database.from({ f: 'sigpq_familiars' })
        .select(
          '*',
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .where('f.pessoafisica_id', resp.id)
        .where('f.eliminado', false)
        .clone()

      const sigpq_documentos = await Database.from({ d: 'sigpq_documentos' })
        .select(
          "d.id",
          "d.nid",
          "d.anexo",
          "d.local_emissao",
          "d.data_emissao",
          "d.data_expira",
          "d.pessoafisica_id",
          "d.activo",
          "d.sigpq_tipo_documento_id",
          "sigpq_tipo_documentos.nome as sigpq_tipo_documento_nome",
          "d.descricao",
          Database.raw("DATE_FORMAT(d.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(d.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('sigpq_tipo_documentos', 'sigpq_tipo_documentos.id', 'd.sigpq_tipo_documento_id')
        .where('d.pessoafisica_id', resp.id)
        .where('d.eliminado', false)
        .clone()

      const documento = await Database.from({ f: 'sigpq_documentos' })
        .select(
          'id',
          'nid',
          'data_emissao',
          'data_expira'
        )
        .whereNotIn('f.nid', ['Pessoal', 'Profissional'])
        .where('f.pessoafisica_id', resp.id)
        .where('f.eliminado', false)
        .first()
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
        sigpq_funcionario_orgao,
        // foto_efectivo: null,
        // foto_efectivo: resp.foto_efectivo,
        documento
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          const item = {
            ...response,
            // documento
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
