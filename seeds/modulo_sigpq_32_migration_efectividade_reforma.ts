import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  #table: string = "sigpq_estados"
  #table_: string = "sigpq_situacao_estados"
  #table_funcionario_estado = 'sigpq_funcionario_estados'

  public async run() {
    const trx = await Database.transaction()
    try {

      const pessoasInactiva = await Database.from({ p: 'pessoafisicas' }).whereIn('p.estado', ['Reforma', 'Pré-Reforma', 'Inactivo', 'Falecido']).innerJoin('sigpq_funcionarios', 'sigpq_funcionarios.id', 'p.id')

      const pessoasActiva = await Database.from({ p: 'pessoafisicas' }).whereIn('p.estado', ['Activo']).innerJoin('sigpq_funcionarios', 'sigpq_funcionarios.id', 'p.id')



      const situacaoFA = await Database.from({ s: `${this.#table_}` }).select('s.id', 's.sigla').where('s.sigla', 'FA').first();

      const estadoEfectividade = await Database.from(this.#table_).where('sigla', 'EFT').first()


      const estadoExtinsaoLaboral = await Database.from(this.#table).where('sigla', 'EVL').where('sigpq_situacao_id', situacaoFA?.id).first()

      const estadoExtinsaoLaboralReforma = await Database.from(this.#table).where('sigpq_estado_id', estadoExtinsaoLaboral?.id).where('sigpq_situacao_id', situacaoFA?.id).where('sigla', 'RFM').first()

      const estadoExtinsaoLaboralMorte = await Database.from(this.#table).where('sigpq_estado_id', estadoExtinsaoLaboral?.id).where('sigpq_situacao_id', situacaoFA?.id).where('sigla', 'MRT').first()

      const estadoExtinsaoLaboralDemissao = await Database.from(this.#table).where('sigpq_estado_id', estadoExtinsaoLaboral?.id).where('sigpq_situacao_id', situacaoFA?.id).where('sigla', 'DMS').first()

      for (let item of pessoasInactiva) {

        if (['Reforma', 'Pré-Reforma'].includes(item?.estado)) {
          await Database.insertQuery().table(this.#table_funcionario_estado).insert({
            pessoafisica_id: item?.id,
            sigpq_estado_id: estadoExtinsaoLaboral?.id,
            sigpq_situacao_id: situacaoFA?.id,
            sigpq_estado_reforma_id: estadoExtinsaoLaboralReforma?.id,
            user_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
          }).useTransaction(trx)

        } else if (['Inactivo'].includes(item?.estado)) {
          await Database.insertQuery().table(this.#table_funcionario_estado).insert({
            pessoafisica_id: item?.id,
            sigpq_estado_id: estadoExtinsaoLaboral?.id,
            sigpq_estado_reforma_id: estadoExtinsaoLaboralDemissao?.id,
            sigpq_situacao_id: situacaoFA?.id,
            user_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
          }).useTransaction(trx)

        } else if (['Falecido'].includes(item?.estado)) {
          await Database.insertQuery().table(this.#table_funcionario_estado).insert({
            pessoafisica_id: item?.id,
            sigpq_estado_id: estadoExtinsaoLaboral?.id,
            sigpq_estado_reforma_id: estadoExtinsaoLaboralMorte?.id,
            sigpq_situacao_id: situacaoFA?.id,
            user_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
          }).useTransaction(trx)


        }
      }

      for (let item of pessoasActiva) {
        await Database.insertQuery().table(this.#table_funcionario_estado).insert({
          pessoafisica_id: item?.id,
          sigpq_situacao_id: estadoEfectividade?.id,
          user_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        }).useTransaction(trx)

      }

      await trx.commit()

    } catch (error) {
      await trx.rollback()
      console.log(error)
    }

  }
}




