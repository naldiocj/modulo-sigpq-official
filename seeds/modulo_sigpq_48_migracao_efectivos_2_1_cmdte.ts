import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {

    // 412

    try {

      const efectivos = [
        { nome_completo: "ANTÓNIO PEDRO JOAQUIM" },
        { nome_completo: "AMADEU NARCISO LUCAMBA" },
        { nome_completo: "ANTÓNIO FERNANDES CAMPOS" },
        { nome_completo: "AGOSTINHO GERALDO MESSELE" },
        { nome_completo: "AZEVEDO BUMBA" },
        // { nome_completo: "DUMILDE NAMBY EVARISTO" },
        { nome_completo: "DIOGO SIMAO  MANUEL" },
        // { nome_completo: "DOMINGAS JOÃO" },
        { nome_completo: "DULCE MARIA DA CRUZ" },
        { nome_completo: "ENGRÁCIA GASPAR JOÃO" },
        { nome_completo: "FILIPE DOMINGOS" },
        // { nome_completo: "ILIDIO VICENTE" },
        { nome_completo: "JOÃO DE JESUS LEITE" },
        { nome_completo: "LUÍS MIGUEL" },
        { nome_completo: "MAYOMONA JOAON MIRANDA" },
        { nome_completo: "MINERVINA DA CONCEIÇÃO" },
        { nome_completo: "NASCIMENTO ANTÓNIO VUANDA" },
        { nome_completo: "OLIVIA VISSOLELA BERNARDO DO NASCIMENTO" },
        { nome_completo: "SAMUEL BARTOLOMEU" },
        { nome_completo: "SABINO JÚNIOR" },
        // { nome_completo: "TIAGO MALENGUE" },
        { nome_completo: "TOMÉ JOSÉ" }
      ]

      const efectivo_ids: any = []
      const colocacao_ids: any = []

      // // console.log(efectivos.length)


      for (let item of efectivos) {
        const id = await Database.from('pessoas').where('eliminado', 0).where('nome_completo', 'like', `%${item.nome_completo.toString().trim()}%`).first()
        if (id)
          efectivo_ids.push({ pessoafisica_id: id?.id })
      }


      await Database.from('sigpq_funcionario_orgaos').update({
        eliminado: true,
        activo: false,
        updated_at: new Date()
      }).where('activo', true)
        .where('eliminado', false)
        .where('pessoajuridica_id', 358)

      for (let item of efectivo_ids) {

        await Database.from({ sfo: 'sigpq_funcionario_orgaos' })
          .select("*").where('sfo.pessoajuridica_id', 358).where('activo', false).where('eliminado', true).where('sfo.pessoafisica_id', item?.pessoafisica_id).update({
            activo: true,
            eliminado: false,
            updated_at: new Date()
          })
        
      }

      await Database.from({ sfo: 'sigpq_funcionario_orgaos' })
        .select("*").where('sfo.pessoajuridica_id', 358).where('sfo.pessoafisica_id', 412).update({
          activo: true,
          eliminado: false,
          updated_at: new Date()
        }).where('activo', false).where('eliminado', true)
     
    } catch (e) {
      console.log(e.message)
    }
  }
}
