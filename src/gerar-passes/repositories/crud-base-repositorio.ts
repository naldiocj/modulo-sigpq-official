import Database from '@ioc:Adonis/Lucid/Database';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';
import NumeroAutomaticoService from 'App/@piips/shared/service/NumeroAutomaticoService';
const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

export default class CrudBaseRepository extends BaseModuloRepository {
  #numeroAutomaticoService: NumeroAutomaticoService
  public numeroAutomatico: any

  constructor() {
    super('sigpq_passes_funcionarios');
  }

  public async registar(input: any, trxParam = null): Promise<any> {
    let validate = []
    try {
      const camposDesejados: (keyof any)[] = [
        'agentes',
        'user_id'

      ];
      const camposOpcionais: (keyof any)[] = [
        ''
      ];

      validate = mapearCampos(input, camposDesejados, camposOpcionais);

    } catch (error) {
      console.log(error.message);
      return Error(error.message)
    }

    const trx = trxParam ? trxParam : await Database.transaction()
    try {

      for (const agente of input.agentes) {
      
        const passes = {
          ...validate,
          sigpq_funcionario_id: agente?.id,
          codigo: `SC${Math.floor(Math.random() * 9999)}${agente?.nip ?? ''}`,
          activo: true,
          created_at: this.dateTime,
          updated_at: this.dateTime
        }

        delete passes['agentes']

        await Database
          .from('sigpq_passes_funcionarios')
          .useTransaction(trx)
          .where('sigpq_funcionario_id', agente?.id)
          // .where('activo', true)
          .where('eliminado', false)
          .update({ activo: false })

        await Database
          .table('sigpq_passes_funcionarios')
          .useTransaction(trx)
          .insert(passes)

      }

      return trxParam ? trxParam : await trx.commit()
    } catch (e) {
      await trx.rollback()
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }


  public async listarTodos(options: any): Promise<any> {

    try {

      let query: any = Database.from({ pa: 'sigpq_passes_funcionarios' })
        .select(
          "pa.id",
          "pa.codigo",
          "pa.sigpq_funcionario_id",
          'pa.activo',
          Database.raw('upper(pessoas.nome_completo) as nome_completo'),
          'pessoas.user_id',
          Database.raw('upper(pessoafisicas.apelido) as apelido'),
          'pessoafisicas.genero',
          'pessoafisicas.nome_pai',
          'pessoafisicas.nome_mae',
          'pessoafisicas.nacionalidade_id',
          'pessoafisicas.estado_civil_id',
          'pais.nome as pais_nome',
          'pais.nacionalidade as nacionalidade',
          'patentes.nome as patente_nome',
          'patentes.sigpq_tipo_carreira_id as patente_classe',
          'patentes.id as patente_id',
          'estado_civils.nome as estado_civil_nome',
          'f.id as pessoa_id',
          'f.nip',
          'f.numero_processo',
          'f.numero_agente',
          'f.foto_efectivo',
          'f.descricao',
          'pj.id as pessoajuridica_id',
          'regimes.quadro',

          Database.raw('upper(tc.nome) as funcao'),
          Database.raw('upper(tf.nome) as cargo'),


          Database.raw('upper(po.nome_completo) as orgao'),
          Database.raw('upper(pj.sigla ) as orgao_sigla'),
          Database.raw("DATE_FORMAT(pa.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(pa.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('sigpq_funcionarios as f', 'f.id', 'pa.sigpq_funcionario_id')
        .innerJoin('pessoas', 'pessoas.id', 'f.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'f.id')
        .innerJoin('pais', 'pais.id', 'pessoafisicas.nacionalidade_id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('estado_civils', 'estado_civils.id', 'pessoafisicas.estado_civil_id')
        .innerJoin('sigpq_funcionario_orgaos as og ', 'og.pessoafisica_id', 'f.id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'og.pessoajuridica_id')
        .innerJoin('pessoas  as po', 'po.id', 'pj.id')
        .innerJoin('regimes', 'regimes.id', 'pessoafisicas.regime_id')
        .leftJoin('sigpq_cargos as tcp', 'tcp.pessoafisica_id', 'f.id')
        .leftJoin('sigpq_tipo_cargos as tc', 'tc.id', 'tcp.sigpq_tipo_cargo_id')
        .leftJoin('sigpq_funcaos as tfp', 'tfp.pessoafisica_id', 'f.id')
        .leftJoin('sigpq_tipo_funcaos as tf', 'tf.id', 'tfp.sigpq_tipo_funcao_id')
        // .where('tfp.activo', true)
        // .where('tcp.activo', true)
        .orderBy('pa.created_at', 'desc')

        .where(query => {
          if (options.search) {
            query.where("pa.codigo", 'like', `%${options.search}%`)
            query.orWhere("pa.sigpq_funcionario_id", 'like', `%${options.search}%`)
            query.orWhere('pa.activo', 'like', `%${options.search}%`)
            query.orWhere('pessoas.nome_completo', 'like', `%${options.search}%`)
            query.orWhere('pessoas.activo', 'like', `%${options.search}%`)
            query.orWhere('pessoafisicas.apelido', 'like', `%${options.search}%`)
            query.orWhere('pessoafisicas.genero', 'like', `%${options.search}%`)
            query.orWhere('pessoafisicas.nome_pai', 'like', `%${options.search}%`)
            query.orWhere('pessoafisicas.nome_mae', 'like', `%${options.search}%`)
            query.orWhere('pais.nome', 'like', `%${options.search}%`)
            query.orWhere('pais.nacionalidade', 'like', `%${options.search}%`)
            query.orWhere('patentes.nome ', 'like', `%${options.search}%`)
            query.orWhere('estado_civils.nome ', 'like', `%${options.search}%`)
            query.orWhere('f.nip', 'like', `%${options.search}%`)
            query.orWhere('f.numero_processo', 'like', `%${options.search}%`)
            query.orWhere('f.numero_agente', 'like', `%${options.search}%`)
            query.orWhere('f.descricao', 'like', `%${options.search}%`)
            query.orWhere('po.nome_completo', 'like', `%${options.search}%`)
            query.orWhere('pj.sigla', 'like', `%${options.search}%`)
            query.orWhere('tc.nome', 'like', `%${options.search}%`)
            query.orWhere('tf.nome', 'like', `%${options.search}%`)
          }
        })
        .where(query => {
          if (options.pessoafisica_id) {
            query.where('pa.sigpq_funcionario_id', options.pessoafisica_id).orderBy('pa.activo', 'desc').orderBy('pa.created_at', 'desc')
          } else {
            query.where('pa.activo', true).orderBy('pa.activo', 'desc').orderBy('pa.created_at', 'desc')
          }
        })
        .where(query => {
          if (options.patente_id) {
            query.where('patentes.id', options.patente_id)
          }
        })

        .where(query => {
          if (options.genero) {
            query.where('pessoafisicas.genero', options.genero)
          }
        })
        .where(query => {
          if (options.regimeId) {
            query.where('pessoafisicas.regime_id', options.regimeId)
          }
        })

        .where(query => {
          if (options.orgaoId) {
            query.where('f.id', options.orgaoId)
          }
        })
        .where(query => {
          if (options.patenteClasse) {

            query.where('patentes.sigpq_tipo_carreira_id', options.patenteClasse)
          }
        })

      return options.page ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async listarUm(id: any): Promise<any> {

    try {

      let query: any = Database.from({ pa: 'sigpq_passes_funcionarios' })
        .select(
          "pa.id",
          "pa.codigo",
          "pa.sigpq_funcionario_id",
          'pa.activo',
          Database.raw('uper(pessoas.nome_completo) as nome_completo'),
          'pessoas.user_id',
          'pessoas.activo',
          Database.raw('upper(pessoafisicas.apelido) as apelido'),
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
          Database.raw('upper(tc.nome) as funcao'),
          Database.raw('upper(tf.nome) as cargo'),


          Database.raw('upper(po.nome_completo) as orgao'),
          Database.raw('upper(pj.sigla ) as orgao_sigla'),

          Database.raw("DATE_FORMAT(pa.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(pa.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('sigpq_funcionarios as f', 'f.id', 'pa.sigpq_funcionario_id')
        .innerJoin('pessoas', 'pessoas.id', 'f.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'f.id')
        .innerJoin('pais', 'pais.id', 'pessoafisicas.nacionalidade_id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('estado_civils', 'estado_civils.id', 'pessoafisicas.estado_civil_id')
        .innerJoin('sigpq_funcionario_orgaos as og ', 'og.pessoafisica_id', 'f.id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'og.pessoajuridica_id')
        .innerJoin('pessoas  as po', 'po.id', 'pj.id')
        .leftJoin('sigpq_cargos as tcp', 'tcp.pessoafisica_id', 'f.id')
        .leftJoin('sigpq_tipo_cargos as tc', 'tc.id', 'tcp.sigpq_tipo_cargo_id')
        .leftJoin('sigpq_funcaos as tfp', 'tfp.pessoafisica_id', 'f.id')
        .leftJoin('sigpq_tipo_funcaos as tf', 'tf.id', 'tfp.sigpq_tipo_funcao_id')
        .where('pa.id', id)
        .where('pa.eliminado', false)
        .first()
      return await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async gerador(mobilidadeId: any): Promise<any> {
    try {

      let query = Database.from({ f: 'sigpq_funcionarios' })
        .select(
          'pessoas.nome_completo',
          'patentes.nome as patente_nome',
          'f.nip',
          'f.numero_processo',
          'f.numero_agente',
          'f.foto_efectivo',
          'f.descricao',
          'f.id',
          'm.id as sigpq_mais_mobilidade_id',
          "m.ordenante as comandante",
          "m.sigpq_fun_id as sigpq_funcionario_orgao_id",
        )
        .innerJoin('pessoas', 'pessoas.id', 'f.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'f.id')
        .innerJoin('pais', 'pais.id', 'pessoafisicas.nacionalidade_id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('estado_civils', 'estado_civils.id', 'pessoafisicas.estado_civil_id')
        .innerJoin('sigpq_mais_mobilidades as m', 'm.pessoafisica_id', 'f.id')
        .where('sigpq_provimentos.activo', true)
        .where('m.sigpq_fun_id', mobilidadeId)
        .first()

      return await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }
  }

}



module.exports = CrudBaseRepository