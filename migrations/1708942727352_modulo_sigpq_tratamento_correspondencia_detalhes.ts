import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "sigpq_trata_corres_detalhes";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table
        .integer("pessoafisica_id")
        .references("id")
        .inTable("pessoafisicas");
      table
        .integer("pessoajuridica_id")
        .references("id")
        .inTable("pessoajuridicas");
      table.integer("pessoajuridica_destino_id").nullable();
      table.integer("pessoafisica_destino_id").nullable();
      table.text("nota").nullable();
      table.boolean("anexado").defaultTo(false);
      table.string("anexo").nullable();
      table.integer("user_id").unsigned().references("users");
      table.boolean("eliminado").defaultTo(false);
      table.boolean("activo").defaultTo(true);
      table
        .integer("sigpq_trata_corr_id")
        .unsigned()
        .references("id")
        .inTable("sigpq_tratamento_correspondencias");
      table
        .integer("procedencia_correspondencia_id").
        nullable()

      table.dateTime("created_at", { useTz: true });
      table.dateTime("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
