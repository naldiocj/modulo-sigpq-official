import Database from "@ioc:Adonis/Lucid/Database";
import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";

export default class extends BaseSeeder {
  public async run() {
    const trx = await Database.transaction();
    try {
      await Database.from("sigpq_funcionarios")
        // .where("eliminado", false)
        .where("sigpq_tipo_vinculo_id", 3)
        .update({
          sigpq_tipo_vinculo_id: 1,
          // user_id: 1,
        })
        .useTransaction(trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      console.log(
        "Error na migração dos agentes de 3 para 1 (tipo de vinculo): " + error
      );
    }
  }
}
