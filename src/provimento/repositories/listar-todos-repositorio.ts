import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";

// interface ListarTodosOptions {
//   pessoa_id?: number
//   search?: string
//   page?: number
//   perPage?: number
// }

export default class ListarTodosRepository {
  public async listarTodos(options: any): Promise<any> {
    try {
      let query: DatabaseQueryBuilderContract = Database.from(
        "sigpq_provimentos as p"
      )
        .select(
          "p.id",
          "p.activo",
          "p.numero_despacho",
          "p.numero_ordem",
          "p.situacao",
          "p.pessoa_id",
          "p.ordem_descricao",
          "p.despacho_descricao",
          "p.sigpq_documento_id",
          "sigpq_documentos.anexo",
          Database.raw(
            "DATE_FORMAT(p.data_provimento, '%d/%m/%Y') as data_provimento"
          ),
          "sigpq_acto_progressaos.nome as sigpq_acto_progressaos_nome",
          "patentes.nome as patente_nome",
          Database.raw(
            "DATE_FORMAT(p.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw("DATE_FORMAT(p.created_at, '%d/%m/%Y') as createdAt"),
          Database.raw(
            "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
          // Database.raw('COUNT(*) as total')
        )
        .innerJoin("patentes", "patentes.id", "p.patente_id")
        .leftJoin(
          "sigpq_acto_progressaos",
          "sigpq_acto_progressaos.id",
          "p.acto_progressao_id"
        )
        .leftJoin(
          "sigpq_documentos",
          "sigpq_documentos.id",
          "p.sigpq_documento_id"
        );

      if (options?.pessoa_id) {
        query.where("p.pessoa_id", options.pessoa_id);
      }

      if (options.sigpq_acto_progressao_id) {
        query.where("p.acto_progressao_id", options.sigpq_acto_progressao_id);
      }
      if (options.patenteId) {
        query.where("p.patente_id", options.patenteId);
      }
      if (options.patenteClasse) {
        query.where("patentes.sigpq_tipo_carreira_id", options.patenteClasse);
      }

      if (options?.search) {
        query.where((builder) => {
          builder
            .where("patentes.nome", "like", `%${options.search}%`)
            .orWhere("p.numero_despacho", "like", `%${options.search}%`)
            .orWhere("p.numero_ordem", "like", `%${options.search}%`)
            .orWhere("p.situacao", "like", `%${options.search}%`)
            .orWhere(
              "sigpq_acto_progressaos.nome",
              "like",
              `%${options.search}%`
            )
            .orWhere("p.data_provimento", "like", `%${options.search}%`)
            .orWhere("p.ordem_descricao", "like", `%${options.search}%`)
            .orWhere("p.despacho_descricao", "like", `%${options.search}%`);
        });
      }

      query
        // .orderBy('p.data_provimento', 'desc')
        .orderBy("p.created_at", "desc");

      if (options?.page) {
        return await query.paginate(options.page, options.perPage || 10);
      }
      return await query;
    } catch (e) {
      console.error("Erro ao listar os registros: ", e);
      throw new Error("Não foi possível listar os registos.");
    }
  }

  public async listarOrdem(options: any): Promise<any> {
    try {
      let query: DatabaseQueryBuilderContract = Database.from(
        "sigpq_provimentos as p"
      )
        .select(
          "p.activo",
          "p.numero_ordem",
          "p.situacao",
          "p.ordem_descricao",
          "p.data_provimento"

          // Database.raw(
          //   "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          // ),
          // Database.raw("DATE_FORMAT(p.updated_at, '%d/%m/%Y') as createdAt")
        )
        .innerJoin("patentes", "patentes.id", "p.patente_id")
        .innerJoin(
          "sigpq_acto_progressaos",
          "sigpq_acto_progressaos.id",
          "p.acto_progressao_id"
        )
        .where("p.activo", true)
        .whereNotNull("p.numero_ordem")
        .whereNotNull("p.ordem_descricao")
        .groupBy([
          "p.ordem_descricao",
          "p.data_provimento",
          "p.numero_ordem",
          "p.situacao",
          "p.activo",
          "p.situacao",
        ])
        .count("* as total")
        .where("p.situacao", "actual");

      if (options.sigpq_acto_progressao_id) {
        query.where("p.acto_progressao_id", options.sigpq_acto_progressao_id);
      }
      if (options.patenteId) {
        query.where("p.patente_id", options.patenteId);
      }
      if (options.patenteClasse) {
        query.where("patentes.sigpq_tipo_carreira_id", options.patenteClasse);
      }

      if (options?.search) {
        query.where((builder) => {
          builder
            .where("patentes.nome", "like", `%${options.search}%`)
            .orWhere("p.numero_despacho", "like", `%${options.search}%`)
            .orWhere("p.numero_ordem", "like", `%${options.search}%`)
            .orWhere("p.situacao", "like", `%${options.search}%`)
            .orWhere(
              "sigpq_acto_progressaos.nome",
              "like",
              `%${options.search}%`
            )
            .orWhere("p.data_provimento", "like", `%${options.search}%`)
            .orWhere("p.ordem_descricao", "like", `%${options.search}%`)
            .orWhere("p.despacho_descricao", "like", `%${options.search}%`)
            .orWhere("p.updated_at", "like", `%${options.search}%`);
        });
      }

      query.orderBy("p.data_provimento", "desc");
      // .orderBy("p.updated_at", "desc");

      if (options?.page) {
        const page = await query.paginate(options.page, options.perPage || 10);
        page["rows"] = await Promise.all(
          page["rows"].map(async (item) => {
            const created_ = await Database.from("sigpq_provimentos as p")
              .select(
                "p.ordem_descricao",
                "p.numero_ordem",
                Database.raw(
                  "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
                )
              )
              .whereNotNull("p.numero_ordem")
              .whereNotNull("p.ordem_descricao")
              .where("p.ordem_descricao", item?.ordem_descricao)
              .first();

            return {
              ...item,
              created_at: created_?.updated_at,
            };
          })
        );
        return page;
      } else {
        const all = await query.paginate(options.page, options.perPage || 10);
        const items = await Promise.all(
          all.map(async (item) => {
            const created_ = await Database.from("sigpq_provimentos as p")
              .select(
                "p.ordem_descricao",
                "p.numero_ordem",
                Database.raw(
                  "DATE_FORMAT(p.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
                )
              )
              .whereNotNull("p.numero_ordem")
              .whereNotNull("p.ordem_descricao")
              .where("p.ordem_descricao", item?.ordem_descricao)
              .first();

            return {
              ...item,
              created_at: created_?.updated_at,
            };
          })
        );
        return items;
      }
    } catch (e) {
      console.error("Erro ao listar os registros: ", e);
      throw new Error("Não foi possível listar os registos.");
    }
  }
}
