import Database from "@ioc:Adonis/Lucid/Database";

export default class EliminarRepository {
  async execute(id: any, user_id: any, trx: any = null) {
    trx = trx ?? (await Database.transaction());
    try {
      const query = await Database.from("sigpq_agente_em_excepcaos")
        .where("eliminado", false)
        .where("sigpq_funcionario_id", id);

      if (!query) return Error("Não foi possível encontra item");

      await Database.from("sigpq_agente_em_excepcaos")
        .where("sigpq_funcionario_id", id)
        .update({
          eliminado: true,
          user_id,
        })
        .useTransaction(trx);

      return await trx.commit();
    } catch (error) {
      await trx.rollback();
      console.log(error);
      return Error("Não foi possível eliminar item");
    }
  }
}
