import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'
export default class extends BaseSeeder {
  #table = "modulo_sigpq_feriados";
  public async run() {
    // Write your database queries inside the run method

    const dataNew = [
      {
        nome: 'Ano Novo',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Início de um novo ano.',
        dia_selecionado: new Date('2024-01-01'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia do Início da Luta Armada',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebra o início da luta pela independência de Angola.',
        dia_selecionado: new Date('2024-02-04'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Carnaval',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Comemoração do Carnaval.',
        dia_selecionado: new Date('2024-02-12'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Carnaval',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Comemoração do Carnaval.',
        dia_selecionado: new Date('2024-02-13'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia Internacional da Mulher',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebra a luta pelos direitos das mulheres.',
        dia_selecionado: new Date('2024-03-08'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia da Libertação da África Austral',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebra a libertação da região da África Austral.',
        dia_selecionado: new Date('2024-03-23'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Sexta Santa',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebração cristã da Paixão de Cristo.',
        dia_selecionado: new Date('2024-03-29'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia da Paz',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebra a paz e a reconciliação nacional.',
        dia_selecionado: new Date('2024-04-04'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia da Paz',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebra a paz e a reconciliação nacional.',
        dia_selecionado: new Date('2024-04-05'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia do Trabalhador',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebra os direitos e conquistas dos trabalhadores.',
        dia_selecionado: new Date('2024-05-01'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia do Fundador da Nação e dos Heróis Nacionais',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebra os feitos de Agostinho Neto e dos heróis nacionais.',
        dia_selecionado: new Date('2024-09-16'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia do Fundador da Nação e dos Heróis Nacionais',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebra os feitos de Agostinho Neto e dos heróis nacionais.',
        dia_selecionado: new Date('2024-09-17'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia dos Finados',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebração em memória dos falecidos.',
        dia_selecionado: new Date('2024-11-02'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dia da Independência de Angola',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Comemora a independência de Angola.',
        dia_selecionado: new Date('2024-11-11'),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Natal',
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        observacoes: 'Celebração do nascimento de Jesus Cristo.',
        dia_selecionado: new Date('2024-12-25'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];


    // await repo.createMany(dataNew)
    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table(this.#table)
        .insert(iterator)
    }

  }
}
