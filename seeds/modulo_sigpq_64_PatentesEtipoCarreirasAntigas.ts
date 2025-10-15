import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {

  public async run() {

    const dataNew_v2 = {
      nome: 'Historico',
      sigla: 'HS',
      ordem: 12,
      user_id: 2,
      regime_id: 1,
      activo: true,
      eliminado: false,
      descricao: 'Criado automaticamente pelo sistema.',
      created_at: new Date(),
      updated_at: new Date()
    }

    await Database
      .insertQuery()
      .table("sigpq_tipo_carreiras")
      .insert(dataNew_v2)

    const resultado = await Database
      .from("sigpq_tipo_carreiras")
      .where('nome', 'LIKE', `%Historico%`)
      .first();

    const dataNew = [
      { 'user_id': 1, 'classe': 'Oficial Comissário', 'nome': 'Comissário-chefe 2.º Comandante Geral', 'sigla': 'CFCG',  'descricao': 'Criado automaticamente pelo sistema','activo':true, 'sigpq_tipo_carreira_id':7, 'eliminado':false, 'created_at': new Date(), 'updated_at': new Date() },
      { 'user_id': 1, 'classe': 'Historico', 'nome': '1.º SUPERINTENDENTE', 'sigla': 'ST',  'descricao': 'Criado automaticamente pelo sistema','activo':true, 'sigpq_tipo_carreira_id':resultado.id, 'eliminado':false, 'created_at': new Date(), 'updated_at': new Date() },
      { 'user_id': 1, 'classe': 'Historico', 'nome': 'ASPIRANTE', 'sigla': 'ASP',  'descricao': 'Criado automaticamente pelo sistema','activo':true, 'sigpq_tipo_carreira_id':resultado.id, 'eliminado':false, 'created_at': new Date(), 'updated_at': new Date() },
      { 'user_id': 1, 'classe': 'Historico', 'nome': '1.º SARGENTO', 'sigla': '1SARG',  'descricao': 'Criado automaticamente pelo sistema','activo':true, 'sigpq_tipo_carreira_id':resultado.id, 'eliminado':false, 'created_at': new Date(), 'updated_at': new Date() },
      { 'user_id': 1, 'classe': 'Historico', 'nome': '2.º SARGENTO', 'sigla': '2SARG',  'descricao': 'Criado automaticamente pelo sistema','activo':true, 'sigpq_tipo_carreira_id':resultado.id, 'eliminado':false, 'created_at': new Date(), 'updated_at': new Date() },
      { 'user_id': 1, 'classe': 'Historico', 'nome': '3.º SARGENTO', 'sigla': '3SARG',  'descricao': 'Criado automaticamente pelo sistema','activo':true, 'sigpq_tipo_carreira_id':resultado.id, 'eliminado':false, 'created_at': new Date(), 'updated_at': new Date() },
      { 'user_id': 1, 'classe': 'Historico', 'nome': 'AGENTE', 'sigla': 'AG',  'descricao': 'Criado automaticamente pelo sistema','activo':true, 'sigpq_tipo_carreira_id':resultado.id, 'eliminado':false, 'created_at': new Date(), 'updated_at': new Date() },
      { 'user_id': 1, 'classe': 'Historico', 'nome': 'ALVORADO', 'sigla': 'AL',  'descricao': 'Criado automaticamente pelo sistema','activo':true, 'sigpq_tipo_carreira_id':resultado.id, 'eliminado':false, 'created_at': new Date(), 'updated_at': new Date() },
    ];

    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table('patentes')
        .insert(iterator)
    }
    console.log("Patentes Antigas registado.");
  }
}
