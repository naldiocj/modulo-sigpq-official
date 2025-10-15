import Database from "@ioc:Adonis/Lucid/Database";
import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";

export default class extends BaseSeeder {
  public async run() {
    const ids: number[] = [12, 13, 14, 15];

    ids.forEach(async (id: number) => {
      await Database.from("sigpq_tipo_vinculos").where("id", id).update({
        eliminado: true,
        user_id: 1,
      });
    });
  }
}
