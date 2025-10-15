
import Database from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "App/Repositories/modulo/BaseModuloRepository";
import CrudBaseRepository from "../../config/direcao-ou-orgao/repositories/crud-base-repositorio";
import VerRepository from "../../funcionario/repositories/ver-repositorio";
import { estado } from "../../correspondencia/utils/cor-estado-utils";

const {
  uploadFile,
  deleteFileUrl
} = require("App/@piips/shared/metodo-generico/Upload-Or-Read-File");
const mapearCampos = require("App/@piips/shared/metodo-generico/MapearCampos");

interface ITratamento {
  pessoajuridica_id: number;
  pessoafisica_id: number;
  user_id: number;
  nota?: string;
  sigpq_correspondencia_id: number;
  procedencia_correspondencia_id?: number;
  pessoajuridica_destino_id?: number;
  pessoafisica_destino_id?: number;
  estado: string;
  anexado?: number | boolean;
}

const cores = {
  S: {
    nome: "rgb(64, 232, 22)"
  },
  P: {
    nome: "#FFA500"
  },
  E: {
    nome: "rgb(254, 176, 25)"
  },
  D: {
    nome: "#73BC64"
  },
  PR: {
    nome: "#FFFF00"
  },
  PA: {
    nome: "#000000"
  },
  EX: {
    nome: "#826AF9"
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
    file: any,
    trxParam: any = null
  ): Promise<any> {


    try {
      const camposDesejados: (keyof any)[] = [
        "pessoajuridica_id",
        "sigpq_correspondencia_id",
        "pessoafisica_id",
        "nota",
        "estado"
      ];

      const camposOpcionais: (keyof any)[] = [
        "procedencia_correspondencia_id",
        "pessoajuridica_destino_id",
        "pessoafisica_destino_id"
      ];
      mapearCampos(input, camposDesejados, camposOpcionais);
    } catch (error) {
      console.log(error.message);
      return Error(error.message);
    }
    let fileAnexoPath: any = "";

    trxParam = trxParam ?? (await Database.transaction());
    try {
      const anexoFile = file.file("anexo");
      fileAnexoPath = anexoFile
        ? await uploadFile(
          input.pessoafisica_id +
          "/anexo-tratamento-correspondencia",
          anexoFile
        )
        : null;

      const cor = cores[input.estado.toString().toUpperCase()].nome;


      await Database.from('sigpq_tratamento_correspondencias').where('correspondencia_id', input.sigpq_correspondencia_id).useTransaction(trxParam).update({ activo: false })

      const tratamentoInput = {
        estado: input.estado.toString().toUpperCase(),
        cor: cor,
        correspondencia_id: input.sigpq_correspondencia_id,
        user_id: input.user_id,
        activo: true || 1,
        ...this.getData
      };

      const tratamentoId = await Database.insertQuery()
        .useTransaction(trxParam)
        .table("sigpq_tratamento_correspondencias")
        .insert(tratamentoInput);

      const tratamentoDetalheInput = {
        nota: input.nota,
        procedencia_correspondencia_id: input.procedencia_correspondencia_id,
        sigpq_trata_corr_id: tratamentoId[0],
        pessoajuridica_id: input.pessoajuridica_id,
        pessoafisica_id: input.pessoafisica_id,
        pessoafisica_destino_id: input.pessoafisica_destino_id,
        pessoajuridica_destino_id: input.pessoajuridica_destino_id,
        anexado: input.anexado,
        user_id: input.user_id,
        activo: true || 1,
        anexo: fileAnexoPath,
        ...this.getData
      };

      await Database.insertQuery().useTransaction(trxParam).table('sigpq_trata_corres_detalhes').insert(tratamentoDetalheInput)
      return trxParam ? await trxParam.commit() : trxParam
    } catch (e) {
      await trxParam.rollback();
      console.log(e);
      // await deleteFileUrl(fileAnexoPath);
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
        .where('t.eliminado', false)
        .orderBy('t.activo', 'desc')
        .where((query: any) => {
          if (options.estado) {
            query.where('t.estado', options.estado)
          }
        })
        .where((query: any) => {
          if (options.sigpq_correspondencia_id) {
            query.where('t.correspondencia_id', options.sigpq_correspondencia_id)
          }
        })
        .where((query: any) => {
          if (options.pessoafisica_id) {
            query.orWhere('td.pessoafisica_id', options.pessoafisica_id)
            query.orWhere('td.pessoafisica_destino_id', options.pessoafisica_id)
          }
        })
        .where((query: any) => {
          if (options.pessoajuridica_id) {
            query.orWhere('td.pessoajuridica_id', options.pessoajuridica_id)
            query.orWhere('td.pessoajuridica_destino_id', options.pessoajuridica_id)
          }
        }).where((query: any) => {
          if (options.search) {
            query.where('t.estado', 'like', `%${options.search}%`)
            query.orWhere('td.nota', 'like', `%${options.search}%`)

          }
        }).clone()

      if (options.page) {
        const pagination = await query.paginate(options.page, options.perPage || 10)

        pagination['rows'] = await Promise.all(pagination['rows'].map(async (item: any) => {
          return {
            ...item,
            agente_remetente: item.pessoafisica_id ? await this.#agente.listarUm(item.pessoafisica_id) : null
            ,
            status: estado(item?.estado),
            agente_destino: item.pessoafisica_destino_id ? await this.#agente.listarUm(item.pessoafisica_destino_id) : null,
            orgao_rementente: item.pessoajuridica_id ? await this.#orgao.listarUm(item.pessoajuridica_id) : null,
            orgao_destino_remente: item.pessoajuridica_destino_id ? await this.#orgao.listarUm(item.pessoajuridica_destino_id) : null
          }
        }))
        return pagination
      } else {

        const items = await query

        const all = await Promise.all(items.map(async (item: any) => {
          return {
            ...item,
            status: estado(item.estado),
            agente_remetente: item.pessoafisica_id ? await this.#agente.listarUm(item.pessoafisica_id) : null
            ,
            agente_destino: item.pessoafisica_destino_id ? await this.#agente.listarUm(item.pessoafisica_destino_id) : null,
            orgao_rementente: item.pessoajuridica_id ? await this.#orgao.listarUm(item.pessoajuridica_id) : null,
            orgao_destino_remente: item.pessoajuridica_destino_id ? await this.#orgao.listarUm(item.pessoajuridica_destino_id) : null
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
