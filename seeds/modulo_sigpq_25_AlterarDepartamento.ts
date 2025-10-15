import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    const trx = await Database.transaction()
    try {

      let query: any = await Database.from({ pj: 'pessoajuridicas' })
        .select(
          'p.id',
          'p.nome_completo',
          'p.user_id',
          'p.activo',
          'pj.nif',
          'pj.site',
          'pj.sigla',
          'pj.logotipo',
          'pj.descricao',
          'pjo.sigla as orgao_sigla',
          'po.nome_completo as orgao',
          'pjo.id as pessoajuridica_id',
          'tpj.nome as tipo_pessoajuridica_nome',

        )
        .innerJoin('pessoas as p', 'p.id', 'pj.id')
        .innerJoin('tipo_pessoajuridicas as tpj', 'tpj.id', 'pj.tipo_pessoajuridica_id')
        .innerJoin('pessoajuridicas as pjo', 'pjo.id', 'pj.pessoajuridica_id')
        .innerJoin('pessoas as po', 'po.id', 'pjo.id')
        .where('p.eliminado', false)
        .clone()

      for (let item of query) {

        await Database.from('pessoajuridicas').where('id', item.id).useTransaction(trx).update({
          orgao_comando_provincial: 'Departamento'
        })
      }

      await trx.commit()
      console.log('Sucesso na alteracao')

    } catch (e) {
      await trx.rollback()
      console.log('Não foi possível listar os registos. ' + e);
    }

  }
}
