import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "sigpq_tratamento_mobilidades";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table
        .enum("estado", ["P", "V", "EX"])
        .defaultTo("P")
        .comment("P - Pendente, V - Visto, EX - Expirado");
      table.string("cor").defaultTo("#cc0000");
      table.integer("user_id").unsigned().references("id").inTable("users");
      
      table.boolean("eliminado").defaultTo(false);
      table.boolean("activo").defaultTo(true);

      table.dateTime("created_at", { useTz: true });
      table.dateTime("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
