import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";
import BaseModuloRepository from "../../../../../../app/Repositories/modulo/BaseModuloRepository";

const validar = require("./../validation/validar");
const validarStadoActivo = require("./../validation/validarStadoActivo");

interface IInput {
  activo: boolean;
  user_id: number;
  quantidade: number;
  patentes_id: string;
  pessoajuridica_id: string;
  data_inicio: string;
  data_fim: string;
  tipo_carreiras_id: string;
}

interface IIalterarInput {
  activo: boolean;
}

/* const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_tipos_licencas'); */

export default class CrudRepository {
  #baseRepo;
  constructor() {
    this.#baseRepo = new BaseModuloRepository(
      "sigpq_vaga_em_promocao_por_orgaos"
    );
  }

  public async alterarStadoActivo(
    id: any,
    input: IIalterarInput,
    trx = null
  ): Promise<any> {
    const valido = validarStadoActivo(input);

    if (["string"].includes(typeof valido)) {
      return Error(valido);
    }
    try {
      const result = await this.#baseRepo.editar(valido, id, trx);
      return result;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível criar uma nova Vaga.");
    }
  }

  public async registar(input: IInput, trx = null): Promise<any> {
    const valido = validar(input);

    if (["string"].includes(typeof valido)) {
      return Error(valido);
    }

    try {
      const defaultValue = {
        quantidade_inicial: valido.quantidade,
      };
      const result = await this.#baseRepo.registar({
        ...defaultValue,
        ...valido,
      });
      /* const result = await tipoFuncaoRepository.registar(valido, trx ? trx : null); */
      return result;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível criar um novo Vaga Orgão.");
    }
  }

  public async editar(id: any, input: IInput, trx = null): Promise<any> {
    const valido = validar(input);

    if (["string"].includes(typeof valido)) {
      return Error(valido);
    }

    try {
      const result = await this.#baseRepo.editar(valido, id, trx);
      return result;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível criar um novo Vaga Orgão.");
    }
  }

  public async delete(id: any, auth: any, trx = null): Promise<any> {
    try {
      const result = await this.#baseRepo.delete(id, trx, auth.user.id);
      return result;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível eliminar o Vaga Orgão.");
    }
  }

  public async listarTodos(options: any): Promise<any> {
    try {
      let query: DatabaseQueryBuilderContract = Database.from({
        s: "sigpq_vaga_em_promocao_por_orgaos",
      })
        .select(
          "s.id",
          "s.quantidade",
          "s.quantidade_inicial",
          "s.activo",
          "s.data_inicio",
          "s.pessoajuridica_id",
          "s.patentes_id",
          "s.situacao",
          "s.tipo_carreiras_id",
          "s.data_fim",
          Database.raw("upper(p.nome) as patentes_nome"),
          Database.raw("upper(pj.sigla) as pessoajuridicas_nome"),
          Database.raw(
            "DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"
          ),
          Database.raw(
            "DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt"
          )
        )
        .innerJoin("patentes as p", "p.id", "s.patentes_id")
        .innerJoin("pessoajuridicas as pj", "pj.id", "s.pessoajuridica_id")

        .where("s.eliminado", false)
        .orderBy("s.id");
      if (options.pessoajuridica_id) {
        query.where("s.pessoajuridica_id", options.pessoajuridica_id);
      }
      if (options.patente_id) {
        query.where("s.patentes_id", options.patente_id);
      }
      if (options.activo) {
        query.where("s.activo", true);
      }
      if (options.situacao) {
        query.where("s.situacao", options.situacao);
      }
      /* if (options.search) {
        query.where('s.nome', 'like', `%${options.search}%`)
      } */

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }
}
