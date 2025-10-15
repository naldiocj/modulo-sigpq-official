import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    const classes = [
      {
        class_actual: 'Sub-Alterno',
        classe_nova: 'Oficial Subalterno'
      },
      {
        class_actual: 'Sub-Chefe',
        classe_nova: 'Subchefe',
        
      },
    
    ]

    for (let item of classes) {
      await Database.from('patentes').where({
        classe: item?.class_actual
      }).update({
        classe: item.classe_nova
      })
    }

  }


}
