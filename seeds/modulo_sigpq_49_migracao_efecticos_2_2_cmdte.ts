import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {

    try {

      const efectivos = [
        { nome_completo: "Domingos Artur" },
        { nome_completo: "GABRIEL DE JESUS  GONÇALVES" },
        { nome_completo: "Leonardo José" },
        { nome_completo: "Marcelino Sanguende" },
        { nome_completo: "Dumilde Selele" },
        { nome_completo: "Salomão Adelino" },
        { nome_completo: "Laurinda Severino" },
        { nome_completo: "Arnaldo Rafael" },
        { nome_completo: "Mário Manuel" },
        { nome_completo: "José Idiuano António" },
        { nome_completo: "Germana Leila André" },
        { nome_completo: "Olímpia Ngueve Avindo" },
        { nome_completo: "António João" },
        { nome_completo: "Olga Dilma Hipólito" },
        { nome_completo: "Domingos Ferreira" },
        { nome_completo: "Fernando Pedro" }
      ]

      const efectivos_ids: any = []
      for (let item of efectivos) {
        const query: any = await Database.from('pessoas').where('nome_completo', 'like', `%${item?.nome_completo.toString().trim().toUpperCase()}%`).where('eliminado', false).first()

        if (query)
          efectivos_ids.push({ pessoafisica_id: query?.id, nome_completo: query.nome_completo })
      }

      for (let item of efectivos_ids) {

        const query = await Database.from({ sfo: 'sigpq_funcionario_orgaos' })
          .select("*").where('sfo.pessoajuridica_id', 359).where('activo', true).where('eliminado', true).where('sfo.pessoafisica_id', item?.pessoafisica_id).first()
        
        if (query) {

          query.pessoajuridica_id = 151053
          query.eliminado = false;
          query.activo = 1
          const { id, ...rest } = query
          await Database.insertQuery().table('sigpq_funcionario_orgaos').insert(rest)
        }

      }
      

    } catch (e) {
     
      console.log('Não foi possível listar os registos. ' + e);
    }
  }
}
