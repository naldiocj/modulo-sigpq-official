import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {

  public async run() {

    const dataNew = [
      {
        nome: 'Agente de 3.ª Classe',
        duracao: 4,
      },
      {
        nome: 'Agente de 2.ª Classe',
        duracao: 5,
      },
      {
        nome: 'Agente de 1.ª Classe',
        duracao: 3,
      },
      {
        nome: '3.º Subchefe',
        duracao: 3,
      },
      {
        nome: '2.º Subchefe',
        duracao: 3,
      },
      {
        nome: '1.º subchefe',
        duracao: 3,
      },
      {
        nome: 'Subinspector',
        duracao: 3,
      },
      {
        nome: 'Inspector',
        duracao: 3,
      },
      {
        nome: 'Inspector-chefe',
        duracao: 4,
      },
      {
        nome: 'Intendente',
        duracao: 4,
      },
      {
        nome: 'Superintendente',
        duracao: 4,
      },
      {
        nome: 'Superintendente-chefe',
        duracao: 5,
      },
      {
        nome: 'Subcomissário',
        duracao: 4,
      },
      {
        nome: 'Comissário',
        duracao: 4,
      },
      {
        nome: 'Comissário-chefe',
        duracao: 4,
      },
    ]

    

    for (let item of dataNew) {
      await Database.from({ p: 'patentes' }).select('p.*').where('p.nome', item.nome).update({
        duracao: item.duracao
      })
    }

    console.log('Adicionar duracao nas patentes')
  }
}
