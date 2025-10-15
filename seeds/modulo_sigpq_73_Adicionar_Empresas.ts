import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
 
    const dataNew = [
      {
        nome: 'Sonangol',
        sigla: 'S.E.', // Sigla única para Sonangol
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Endiama',
        sigla: 'E.D.', // Sigla única para Endiama
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Unitel',
        sigla: 'U.T.', // Sigla única para Unitel
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Movicel',
        sigla: 'M.C.', // Sigla única para Movicel
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Banco de Poupança e Crédito',
        sigla: 'B.P.C.', // Sigla única para Banco de Poupança e Crédito
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Banco Angolano de Investimentos',
        sigla: 'B.A.I.', // Sigla única para Banco Angolano de Investimentos
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'TAAG Angola Airlines',
        sigla: 'T.A.A.', // Sigla única para TAAG Angola Airlines
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'ENSA Seguros',
        sigla: 'E.S.', // Sigla única para ENSA Seguros
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Sodiam',
        sigla: 'S.D.', // Sigla única para Sodiam
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Candando',
        sigla: 'C.D.', // Sigla única para Candando
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Opaia Group',
        sigla: 'O.G.', // Sigla única para Opaia Group
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Grupo Mitrelli',
        sigla: 'G.M.', // Sigla única para Grupo Mitrelli
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Banco Millennium Atlântico',
        sigla: 'B.M.A.', // Sigla única para Banco Millennium Atlântico
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Banco de Fomento Angola',
        sigla: 'B.F.A.', // Sigla única para Banco de Fomento Angola
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Angola Cables',
        sigla: 'A.C.', // Sigla única para Angola Cables
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Mota-Engil Angola',
        sigla: 'M.E.A.', // Sigla única para Mota-Engil Angola
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Nova Cimangola',
        sigla: 'N.C.', // Sigla única para Nova Cimangola
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Sociedade de Desenvolvimento do Polo Industrial do Futi',
        sigla: 'S.D.P.I.F.', // Sigla única para Sociedade de Desenvolvimento do Polo Industrial do Futi
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Companhia Siderúrgica do Cuanza',
        sigla: 'C.S.C.', // Sigla única para Companhia Siderúrgica do Cuanza
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Sociedade Mineira do Catoca',
        sigla: 'S.M.C.', // Sigla única para Sociedade Mineira do Catoca
        user_id: 1,
        descricao: 'Criado automaticamente pelo sistema.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // await repo.createMany(dataNew)
    for (const iterator of dataNew) {
      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table("sigpq_empresas")
        .insert(iterator)
    }
    console.log("Empresas registadas.");

  }
}
