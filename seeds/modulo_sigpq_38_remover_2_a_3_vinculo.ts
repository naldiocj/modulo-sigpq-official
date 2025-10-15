import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    await Database.from('sigpq_tipo_vinculos').where('regime', 'especial').whereIn('sigla', ['DFTV', 'IDT']).update({
      user_id: 1,
      descricao: 'Criado automaticamente pelo sistema.',
      updated_at: new Date(),
      eliminado: true,
    })

    await Database.from('sigpq_tipo_vinculos').where('regime', 'Especial').where('sigla', 'AE').update({
      nome: 'Indeterminado',
      sigla: 'INDT',
      updated_at: new Date()
    })

    await Database.from('sigpq_tipo_vinculos').where('regime', 'Especial').where('sigla', 'AE').update({
      nome: 'Indeterminado',
      sigla: 'INDT',
      updated_at: new Date()
    })

    await Database.from('sigpq_tipo_vinculos').where('regime', 'Geral').where('sigla', 'DTC').update({
      nome: 'Determinado',
      sigla: 'DTD',
      updated_at: new Date()
    })

    await Database.from('sigpq_tipo_vinculos').where('regime', 'Geral').where('sigla', 'EGR').update({
      nome: 'Indeterminado',
      sigla: 'INDTD',
      updated_at: new Date()
    })

    await Database.insertQuery().table('sigpq_tipo_vinculos').insert({
      nome: 'Especial',
      sigla: 'ESP',
      activo: 1,
      regime: 'Geral',
      user_id: 1,
      descricao: 'Criado automaticamente pelo sistema.',
      updated_at: new Date(),
      created_at: new Date(),
    })

  }
}
