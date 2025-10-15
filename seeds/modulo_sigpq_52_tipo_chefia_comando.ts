import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {

    const chefias: any = [
      {
        nome: "Comandante-geral da PNA",
        sigla: 'CMDTE',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "2.º Comandante Geral",
        sigla: 'II-CMDTE',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Inspecção da PNA",
        sigla: 'INS',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Inspecção da PNA",
        sigla: 'INS',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante da Polícia de Guarda Fronteiras",
        sigla: 'CMDTEPGF',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante da Polícia de Intervenção Rápida",
        sigla: 'CMDTEPIR',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Conselheiro",
        sigla: 'CNLH',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Director Nacional",
        sigla: 'DRN',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante Provincial",
        sigla: 'CMDTEPRO',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Unidade de Subordinação Central",
        sigla: 'CMDTEUSC',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Depatamento Nacional Independente",
        sigla: 'CDNI',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Director Nacional Adjunto",
        sigla: 'DRNA',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "2.º Comandante Provincial",
        sigla: 'II-CMDTEPRO',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "2.º Comandante de Unidade de Subordinação Central",
        sigla: 'II-CMDTEUSC',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Director de Centro de Formação",
        sigla: 'DRCF',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Estado-Maior de Unidade de Subordinação Central",
        sigla: 'CEMUSC',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Director Provincial",
        sigla: 'DRPR',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'muito-alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Departamento",
        sigla: 'CHD',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Unidade Provincial",
        sigla: 'CMDTEUPR',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Unidade Operativa",
        sigla: 'CMDTEOP',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Divisão de Polícia",
        sigla: 'CMDTEDP',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Batalhão",
        sigla: 'CMDTB',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Destacamento",
        sigla: 'CMDTC',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante Municipal",
        sigla: 'CMDTEM',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "2.º Comandante de Unidade Provincial",
        sigla: 'II-CMDTUP',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "2.º Comandante de Divisão",
        sigla: 'II-CMDTD',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Estado-Maior de Unidade Provincial",
        sigla: 'CEMUP',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Operações da Divisão Municipal",
        sigla: 'CODM',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Centro Cinoténico",
        sigla: 'CCC',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Repartição",
        sigla: 'CRP',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "2.º Comandante Municipal",
        sigla: 'II-CMDTEM',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'alto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Esquadra Policial",
        sigla: 'CMDTESP',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'medio',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Companhia/Corpo de Aluno",
        sigla: 'CMDTECA',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'medio',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Esquadra de Cavalaria",
        sigla: 'CMDTEC',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'medio',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Destacamento Marítmo",
        sigla: 'CMDTEDM',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'medio',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Esquadrilha de Helicópteros",
        sigla: 'CMDTEH',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'medio',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Secção",
        sigla: 'CSC',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'medio',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Chefe de Posto Policial/Fiscal/Fronteiriço",
        sigla: 'CPFF',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'baixo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: "Comandante de Esquadrão de Cavalaria",
        sigla: 'CMDTEC',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        nivel: 'baixo',
        created_at: new Date(),
        updated_at: new Date()
      },
    ]


    for (let item of chefias) {
      await Database.insertQuery()
        .table('sigpq_tipo_chefia_comandos')
        .insert(item)
    }

    console.log('Sucesso na inserção')

  }
}
