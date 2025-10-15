import Database from '@ioc:Adonis/Lucid/Database';
import BaseRepository from 'App/@piips/core/repository/BaseRepository';
import PatenteRepository from 'App/Repositories/PatenteRepository';
import CrudBaseRepository from '../../config/direcao-ou-orgao/repositories/crud-base-repositorio';
import Repository from '../../funcionario-chefia/repositories/listar-todos-repository';


// const cores = {
//   P: {
//     nome: "rgb(254, 176, 25)"
//   },
//   EX: {
//     nome: "red"
//   },
//   V: {
//     nome: "rgb(0, 143, 251)"
//   }
// };

export const estado = (key: string): string => {
  const estados: any = {
    'P': {
      estado: 'Pendente'
    },
    'A': {

      estado: 'Aprovado'
    },
    'EX': {
      estado: 'Expirado'
    },

  }

  return estados.hasOwnProperty(key) ? estados[key].estado : null;
}

const tipoCargoRepository = new BaseRepository<any>('sigpq_tipo_cargos');
const tipoActoRepository = new BaseRepository<any>('sigpq_acto_progressaos');
const tipoNomeacaoRepository = new BaseRepository<any>('sigpq_acto_nomeacaos');

export default class ListarTodosRepository {

  private patentes: PatenteRepository
  private orgao: CrudBaseRepository
  private listarChefia: Repository
  constructor() {
    this.patentes = new PatenteRepository()
    this.orgao = new CrudBaseRepository()
    this.listarChefia = new Repository()

  }
  public async listarTodos(options: any): Promise<any> {

    try {
      let despachos = Database.from({ pp: 'sigpq_proposta_provimentos' })
        .select(
          "pp.user_id",
          "pp.numero",
          "pp.patente_id",
          "pp.sigpq_acto_progressao_id",
          "pp.estado",
          "pp.cor",
          "pp.pessoajuridica_id",
          "pp.sigpq_tipo_cargo_id",
          "pp.sigpq_acto_nomeacao_id",
          // "pp.sigpq_tipo_cargo_id_actual",
          // "pp.patente_id_actual",
          // "pessoas.nosme_completo as orgao",
          Database.raw('COUNT(pp.numero) as total'),
          Database.raw("DATE_FORMAT(pp.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(pp.created_at, '%d/%m/%Y') as createdAt"),
          // Database.raw("DATE_FORMAT(pp.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        // .where('fo.activo', true)
        .where('pp.activo', true)
        .where('pp.eliminado', false)
        .innerJoin('pessoajuridicas', 'pessoajuridicas.id', 'pp.pessoajuridica_id')
        .innerJoin('pessoas ', 'pessoas.id', 'pessoajuridicas.id')
        .innerJoin('patentes', 'patentes.id', 'pp.patente_id')
        .innerJoin('sigpq_acto_progressaos', 'sigpq_acto_progressaos.id', 'pp.sigpq_acto_progressao_id')
        .orderBy("pp.created_at", 'desc')
        .groupBy([
          // "pp.id",
          "pp.pessoajuridica_id",
          "pp.sigpq_acto_nomeacao_id",
          // "pp.patente_id_actual",
          "pp.created_at",
          "pp.sigpq_tipo_cargo_id",
          // "pp.sigpq_tipo_cargo_id_actual",
          "pp.user_id",
          "pp.numero",
          "pp.cor",
          "pp.patente_id",
          "pp.sigpq_acto_progressao_id",
          "pp.estado",
          "pp.user_id",
          // "pessoas.nome_completo as orgao",
        ]).where(query => {
          if (options.search) {
            query.where('patentes.nome', 'like', `%${options.search}%`)
            query.orWhere('sigpq_acto_progressaos.nome', 'like', `%${options.search}%`)
            query.orWhere('pp.numero', 'like', `%${options.search}%`)
            // query.orWhere('fo.numero_ordem', options.search)
          }
        })

        .where((query: any) => {
          if (options?.user?.aceder_todos_agentes) {
            if (options.orgaoId) {
              query.where('pessoajuridicas.id', options.orgaoId)

            }
            if (options.tipoOrgaoId) {
              query.where('pessoajuridicas.tipo_estrutura_organica_sigla', options.tipoOrgaoId)
            }

          } else {
            query.where('pessoajuridicas.id', options.orgao?.id)
          }
        })

      if (options.numero) {
        despachos.where('pp.numero', options.numero)
      }



      if (options.page) {
        const pagination = await despachos.paginate(options.page, options.perPage || 10);
        pagination['rows'] = await Promise.all(pagination['rows'].map(async (item: any) => {

          const user = await this.buscarUtilizador(item?.user_id)
          const responsavel = await this.mobilidadeResponsavel(item?.user_id)
          if (responsavel instanceof Error) {
            return Error(responsavel.message)
          }
          const chefia: any = await this.listarChefia.execute({ pessoauridica_id: item?.pessoajuridica_id, um: true })
          if (chefia instanceof Error) {
            return Error(chefia.message)
          }
          const patente_promover = item?.patente_id ? await this.patentes.findById(item?.patente_id) : null
          const cargo_promover = item?.sigpq_tipo_cargo_id ? await tipoCargoRepository.listarUmPorId(item?.sigpq_tipo_cargo_id) : null
          // const patente_actual = item?.patente_id_actual ? await this.patentes.findById(item?.patente_id_actual) : null
          // const cargo_actual = item?.sigpq_tipo_cargo_id_actual ? await tipoCargoRepository.listarUmPorId(item?.sigpq_tipo_cargo_id_actual) : null
          const nomeacao = await tipoNomeacaoRepository.listarUmPorId(item?.sigpq_acto_nomeacao_id)
          const acto = await tipoActoRepository.listarUmPorId(item?.sigpq_acto_progressao_id)
          const orgao = await this.orgao.listarUm(item?.pessoajuridica_id)
          const agentes: any = await this.agenteNumeroProposta({ numero: item?.numero })
          delete item.user_id
          delete item.pessoajuridica_id

          return {
            ...item,
            agentes,
            user: user,
            patente_promover,
            cargo_promover,
            // patente_actual,
            // cargo_actual,
            chefia: chefia[0],
            acto,
            orgao,
            nomeacao,
            // tratamento,
            status: estado(item?.estado),
            agente_responsavel: responsavel
          };
        }));

        return pagination;
      } else {
        const items = await despachos;
        const all = await Promise.all(items.map(async (item: any) => {

          const user = await this.buscarUtilizador(item.user_id)
          const responsavel = await this.mobilidadeResponsavel(item?.user_id)

          if (responsavel instanceof Error) {
            return Error(responsavel.message)
          }

          const chefia: any = await this.listarChefia.execute({ pessoauridica_id: item?.pessoajuridica_id, um: true })
          if (chefia instanceof Error) {
            return Error(chefia.message)
          }

          const patente_promover = item?.patente_id ? await this.patentes.findById(item?.patente_id) : null
          const cargo_promover = item?.sigpq_tipo_cargo_id ? await tipoCargoRepository.listarUmPorId(item?.sigpq_tipo_cargo_id) : null
          // const patente_actual = item?.patente_id_actual ? await this.patentes.findById(item?.patente_id_actual) : null
          // const cargo_actual = item?.sigpq_tipo_cargo_id_actual ? await tipoCargoRepository.listarUmPorId(item?.sigpq_tipo_cargo_id_actual) : null
          const nomeacao = await tipoNomeacaoRepository.listarUmPorId(item?.sigpq_acto_nomeacao_id)
          const acto = await tipoActoRepository.listarUmPorId(item?.sigpq_acto_progressao_id)
          const orgao = await this.orgao.listarUm(item?.pessoajuridica_id)
          const agentes: any = await this.agenteNumeroProposta({ numero: item?.numero })
          delete item.user_id
          delete item.pessoajuridica_id

          return {
            ...item,
            agentes,
            user: user,
            patente_promover,
            cargo_promover,
            // patente_actual,
            // cargo_actual,
            orgao,
            chefia: chefia[0],
            acto,
            nomeacao,
            // tratamento,
            status: estado(item?.estado),
            agente_responsavel: responsavel
          };
        }));
        return all;
      }


    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async mobilidadeResponsavel(user_id: any): Promise<any> {

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
        )
        .innerJoin('pessoas', 'pessoas.id', 'f.id')
        .innerJoin('users as u', 'u.pessoa_id', 'pessoas.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'f.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .where('sigpq_provimentos.activo', true)
        .where('u.id', user_id)
        .first()

      return await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }
  }

  public async buscarUtilizador(user_id: any) {
    return await Database.from({ u: 'users' })
      .select(
        "u.id",
        "u.username",
        "u.email"
      )
      .where('u.id', user_id)
      .first()
  }

  public async agenteNumeroProposta(options: any): Promise<any> {
    try {
      let query = Database.from({ f: 'sigpq_funcionarios' })
        .select(

          'f.*',
          'pp.id as sigpq_proposta_provimento_id',
          'pp.*',
          Database.raw('YEAR(DATE(sigpq_provimentos.data_provimento)) as ano_acto'),
          Database.raw("(YEAR(NOW()) - YEAR(DATE(sigpq_provimentos.data_provimento))) as acto_duracao"),

        )
        .innerJoin('sigpq_proposta_provimentos as pp', 'pp.sigpq_funcionario_id', 'f.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'f.id')
        .where('pp.activo', true)
        .where('pp.eliminado', false)

      if (options.numero) {
        query.where('pp.numero', options.numero)
      }
      return await query
    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }
}
