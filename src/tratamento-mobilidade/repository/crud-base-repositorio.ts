
import Database from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";
import CrudBaseRepository from "../../config/direcao-ou-orgao/repositories/crud-base-repositorio";
import VerRepository from "../../funcionario/repositories/ver-repositorio";
import { estado } from "../../correspondencia/utils/cor-estado-utils";

const mapearCampos = require("App/@piips/shared/metodo-generico/MapearCampos");

interface ITratamento {
  pessoajuridica_id: number;
  pessoafisica_id: number;
  user_id: number;
  nota: string;
  numero_guia: string
  estado: string
}

const cores = {
  P: {
    nome: "rgb(254, 176, 25)"
  },
  EX: {
    nome: "red"
  },
  V: {
    nome: "rgb(0, 143, 251)"
  }
};

export default class CrudBaseRepositorio extends BaseModuloRepository {
  #agente: VerRepository
  #orgao: CrudBaseRepository
  constructor() {
    super("sigpq_trata_corres_detalhes");
    this.#agente = new VerRepository()
    this.#orgao = new CrudBaseRepository()
  }

  public async registar(
    input: ITratamento,
    trxParam: any = null
  ): Promise<any> {

    try {
      const camposDesejados: (keyof any)[] = [
        "numero_guia",
        "pessoafisica_id",
        "nota",
        "estado",
        "user_id"
      ];


      mapearCampos(input, camposDesejados);
    } catch (error) {

      return Error(error.message);
    }

    trxParam = trxParam ?? (await Database.transaction());
    try {
      const cor = cores[input.estado.toString().toUpperCase()].nome;
      await Database.from('sigpq_tratamento_mobilidades').where('numero_guia', input.numero_guia).useTransaction(trxParam).update({ activo: false })


      const tratamentoInput = {
        estado: input.estado.toString().toUpperCase(),
        cor: cor,
        numero_guia: input.numero_guia,
        user_id: input.user_id,
        nota: input.nota,
        pessoafisica_id: input.pessoafisica_id,
        activo: true || 1,
        ...this.getData
      };

      await Database.insertQuery()
        .useTransaction(trxParam)
        .table("sigpq_tratamento_mobilidades")
        .insert(tratamentoInput);

      return trxParam ? await trxParam.commit() : trxParam
    } catch (e) {
      await trxParam.rollback();
      console.log(e);
      return Error("Não foi possível registar");
    }
  }

  private get getData() {
    return {
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  public async listarTodos(options: any): Promise<any> {
    try {
      const query: any = Database.from({ t: 'sigpq_tratamento_mobilidades' })
        .select(
          't.*',
          Database.raw("DATE_FORMAT(t.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(t.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),

        )
        .where('t.eliminado', false)
        .orderBy('t.activo', 'desc')
        .where((query: any) => {
          if (options.estado) {
            query.where('t.estado', options.estado)
          }
        })
        .where((query: any) => {
          if (options.numero_guia) {
            query.where('t.numero_guia', options.numero_guia)
          }
        })
        .where((query: any) => {
          if (options.pessoafisica_id) {
            query.orWhere('t.pessoafisica_id', options.pessoafisica_id)

          }
        })
        .where((query: any) => {
          if (options.search) {
            query.where('t.numero_guia', 'like', `%${options.search}%`)
            query.orWhere('t.nota', 'like', `%${options.search}%`)

          }
        }).clone()

      if (options.page) {
        const pagination = await query.paginate(options.page, options.perPage || 10)

        pagination['rows'] = await Promise.all(pagination['rows'].map(async (item: any) => {
          return {
            ...item,
            agente: item.pessoafisica_id ? await this.#agente.listarUm(item.pessoafisica_id) : null
            ,
            status: estado(item?.estado)

          }
        }))
        return pagination
      } else {

        const items = await query

        const all = await Promise.all(items.map(async (item: any) => {
          return {
            ...item,
            status: estado(item.estado),
            agente: item.pessoafisica_id ? await this.#agente.listarUm(item.pessoafisica_id) : null

          }
        }))

        return all
      }

    } catch (e) {
      console.log(e)
      return Error('Não foi possível listar registo')
    }
  }

  public async listarUm(id: any): Promise<any> {
    try {
      const query: any = Database.from({ t: 'sigpq_tratamento_correspondencias' })
        .select(
          't.id',
          't.estado',
          't.cor',
          't.correspondencia_id',
          't.activo',
          Database.raw("DATE_FORMAT(t.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(t.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),

          'td.id as sigqp_tratamento_correspondencia_detalhe_id',
          'td.nota',
          'td.anexo',
          'td.pessoafisica_id',
          'td.pessoajuridica_id',
          'td.pessoajuridica_destino_id',
          'td.pessoafisica_destino_id',
          'pc.id as procedencia_correspondencia_id',
          'pc.nome as procedencia',


        )
        .innerJoin('sigpq_trata_corres_detalhes as td', 'td.sigpq_trata_corr_id', 't.id')
        .leftJoin('procedencia_correspondencias as pc', 'pc.id', 'td.procedencia_correspondencia_id')
        .where('td.id', id).first()

      const item = await query
      return {
        ...item,
        agente_remetente: item.pessoafisica_id ? await this.#agente.listarUm(item.pessoafisica_id) : null
        ,
        status: estado(item.estado),
        agente_destino: item.pessoafisica_destino_id ? await this.#agente.listarUm(item?.pessoafisica_destino_id) : null,
        orgao_rementente: item.pessoajuridica_id ? await this.#orgao.listarUm(item?.pessoajuridica_id) : null,
        orgao_destino_remente: item.pessoajuridica_destino_id ? await this.#orgao.listarUm(item?.pessoajuridica_destino_id) : null
      }

    } catch (e) {
      console.log(e)
      return Error('Não foi possível listar registo')
    }
  }
}
