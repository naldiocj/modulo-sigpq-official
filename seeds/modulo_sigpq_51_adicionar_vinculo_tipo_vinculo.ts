import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {

  public async run() {

    try {

      await Database.from('sigpq_tipo_vinculos').where('sigla', 'ESP').update({
        eliminado: true,
        user_id: 1,
        updated_at: new Date()
      })

      const ind = await Database.from('sigpq_tipo_vinculos').where('sigla', 'DTD').first()

      const indVinculos = [
        {
          nome: '6 meses de duração',
          sigla: 'SMD',
          activo: 1,
          user_id: 1,
          sigpq_vinculo_id: ind?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date(),
          regime: 'Especial'
        },
        {
          nome: '12 meses de duração',
          sigla: 'DMD',
          activo: 1,
          user_id: 1,
          sigpq_vinculo_id: ind?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date(),
          regime: 'Especial'
        },
        {
          nome: '36 meses de duração',
          sigla: 'TDMD',
          activo: 1,
          user_id: 1,
          sigpq_vinculo_id: ind?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date(),
          regime: 'Especial'
        },
        {
          nome: '60 meses de duração',
          sigla: 'STMD',
          activo: 1,
          user_id: 1,
          sigpq_vinculo_id: ind?.id,
          descricao: 'Criado automaticamente pelo sistema.',
          created_at: new Date(),
          updated_at: new Date(),
          regime: 'Especial'
        },
      ]

      for (let item of indVinculos) {
        await Database.insertQuery().table('sigpq_tipo_vinculos').insert(item)
      }
    } catch (e) {
      console.log(e)
    }

  }
}
