import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "sigpq_mapa_funcionarios";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table
        .integer("sigpq_mapa_id")
        .unsigned()
        .references("id")
        .inTable("sigpq_mapas");

      table
        .integer("pessoafisica_id")
        .unsigned()
        .references("pessoas.id")
        .onDelete("RESTRICT");

      table
        .integer("pessoajuridica_id")
        .references("id")
        .inTable("pessoajuridicas");

      table.boolean("activo").defaultTo(true);

      table.boolean("eliminado").defaultTo(false);

      table.dateTime("created_at", { useTz: true });
      table.dateTime("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
