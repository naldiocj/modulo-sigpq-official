import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";

import FuncaoRepo from "./../../funcao/repositories/crud-repositorio";

export default class MapaCargoDirecaoChefiaRepository {
  dateTime = new Date();
  #table = "sigpq_funcionarios";

  #funcaoRepo;

  constructor() {
    this.#funcaoRepo = new FuncaoRepo();
  }

  public async listarTodos(id: any, response: any = null): Promise<any> {
    try {
      const funcoes = await Database.from("sigpq_tipo_funcaos")
        .select(
          "*",
          Database.raw(
            "DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as createdAt"
          ),
          Database.raw(
            "DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt"
          )
        )
        .orderBy('nome', 'asc')
        .where("eliminado", false);

      const queryEfectivos = Database.from("sigpq_funcionarios")
        .count("sigpq_funcionarios.id as total")
        .distinct()
        .innerJoin("pessoas", "pessoas.id", "sigpq_funcionarios.id")
        .innerJoin("pessoafisicas", "pessoafisicas.id", "sigpq_funcionarios.id")
        .innerJoin(
          "sigpq_provimentos",
          "sigpq_provimentos.pessoa_id",
          "pessoas.id"
        )
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin(
          "sigpq_funcionario_orgaos",
          "sigpq_funcionario_orgaos.pessoafisica_id",
          "pessoas.id"
        )
        .innerJoin(
          "sigpq_funcaos",
          "sigpq_funcaos.pessoafisica_id",
          "pessoas.id"
        )
        .where("pessoas.eliminado", false)
        .where("pessoafisicas.estado", "activo")
        .where("sigpq_funcaos.activo", true)
        .where("sigpq_funcaos.eliminado", false)
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false);

      const list: any = [];
      for (const funcao of funcoes) {

        // Masculino
        const masculino = await queryEfectivos
          .clone()
          .where("pessoafisicas.genero", "M") // Especial
          .where('sigpq_funcaos.sigpq_tipo_funcao_id',funcao.id)
          .first();

        // feminino
        const feminino = await queryEfectivos
          .clone()
          .where("pessoafisicas.genero", "F") // Especial
          .where('sigpq_funcaos.sigpq_tipo_funcao_id',funcao.id)
          .first();

        list.push({
          nome: funcao.nome,
          generoM: masculino.total,
          generoF: feminino.total,
          subtotal: masculino.total + feminino.total,
        });
      }

      return list;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }
}
