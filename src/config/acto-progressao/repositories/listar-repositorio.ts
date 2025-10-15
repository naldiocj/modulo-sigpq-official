import Database, {
  DatabaseQueryBuilderContract,
} from "@ioc:Adonis/Lucid/Database";
// import sigpq_acto_progressaos from 'addons/modulo-sigpq/models/sigpq_acto_progressaos';

export default class ListarRepositorio {
  public async listarTodos(options: any): Promise<any> {
    try {
      // return await sigpq_acto_progressaos
      // .query()
      // .first() // 👈 Adds `LIMIT 1` clause

      let query: DatabaseQueryBuilderContract = Database.from(
        "sigpq_acto_progressaos"
      )
        .select(
          "id",
          "nome",
          "sigla",
          "activo",
          "descricao",
          Database.raw(
            "DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as createdAt"
          ),
          Database.raw(
            "DATE_FORMAT(updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt"
          )
        )
        .orderBy("ordem", "asc")
        .where("eliminado", false)
        .clone();

      if (options.classeAbaixo) {
        query.whereNot("nome", "Graduação").andWhereNot("nome", "Desgraduação");
      }

      if (options.classeAcima) {
        query.whereNot("nome", "Promoção").andWhereNot("nome", "Despromoção");
      }

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query;
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }
}
