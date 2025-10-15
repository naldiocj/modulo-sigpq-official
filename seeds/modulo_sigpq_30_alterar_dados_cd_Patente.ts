import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    await Database.from('users').where('pessoa_id', 27793).update({
      aceder_todos_agentes: 1,
      aceder_painel_piips: 1
    })

    await Database.from('sigpq_funcionario_orgaos').where('pessoafisica_id', 27793).update({
      eliminado: 0
    })

    await Database.from('users').where('pessoa_id', 2793).update({
      aceder_todos_agentes: 1,
      aceder_painel_piips: 1
    })

    await Database.from('sigpq_funcionario_orgaos').where('pessoafisica_id', 2793).update({
      eliminado: 0
    })
    await Database.from('users').where('pessoa_id', 70).update({
      aceder_todos_agentes: 1,
      aceder_painel_piips: 1
    })

    await Database.from('sigpq_funcionario_orgaos').where('pessoafisica_id', 70).update({
      eliminado: 0
    })

    await Database.from('sigpq_acto_progressaos').where('sigla', 'PTM').where('nome', 'Patenteamente').update({ nome: 'Patenteamento' })
  }
}
