import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {

  public async run() {

    const resultado = await Database
      .from("sigpq_tipo_carreiras") // substitua 'sua_tabela' pelo nome da sua tabela
      .where('nome', 'LIKE', `%Historico%`)
      .first();

    const dataNew = [
      { 'user_id': 1, 'classe': 'Historico', 'nome': 'SUBINTENDENTE', 'sigla': 'SUB-INTE', 'descricao': 'Criado automaticamente pelo sistema', 'activo': true, 'sigpq_tipo_carreira_id': resultado.id, 'eliminado': false, 'created_at': new Date(), 'updated_at': new Date() },
    ];

    // await repo.createMany(dataNew)
    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table("patentes")
        .insert(iterator)
    }
    console.log("Patentes Antigas registado.");
  }
}
