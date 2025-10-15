import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "sigpq_vaga_em_promocao_por_orgaos";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer("quantidade_inicial")
        .unsigned()
        .defaultTo("0")
        .after("user_id");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns("quantidade_incial", "quantidade_restante");
    });
  }
}
