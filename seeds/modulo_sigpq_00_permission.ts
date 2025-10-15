import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Permission from 'App/Models/Permission'
import Modulo from 'App/Models/Modulo'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method

    const modulo = await Modulo.findBy('sigla', 'SIGPQ') || {id:1}

    const funcionario = [
      {
        modulo_id: modulo?.id,
        nome: 'Listar Funcionários',
        name: 'funcionario-index',
        tabela: 'Funcionário',
        operacao: 'Listar',
        descricao: 'Criado automaticamente pelo sistema.',
      },
      {
        modulo_id: modulo?.id,
        nome: 'Visualizar Funcionário',
        name: 'funcionario-show',
        tabela: 'Funcionário',
        operacao: 'Visualizar',
        descricao: 'Criado automaticamente pelo sistema.',
      },
      {
        modulo_id: modulo?.id,
        nome: 'Eliminar Funcionário',
        name: 'funcionario-delete',
        tabela: 'Funcionário',
        operacao: 'Eliminar',
        descricao: 'Criado automaticamente pelo sistema.',
      },
      {
        modulo_id: modulo?.id,
        nome: 'Actualizar Funcionário',
        name: 'funcionario-update',
        tabela: 'Funcionário',
        operacao: 'Actualizar',
        descricao: 'Criado automaticamente pelo sistema.',
      },
      {
        modulo_id: modulo?.id,
        nome: 'Registar Funcionário',
        name: 'funcionario-store',
        tabela: 'Funcionário',
        operacao: 'Registar',
        descricao: 'Criado automaticamente pelo sistema.',
      }
    ]
    await Permission.createMany(funcionario)

    const provimento = [
      {
        modulo_id: modulo?.id,
        nome: 'Listar Provimento',
        name: 'provimento-index',
        tabela: 'Provimento',
        operacao: 'Listar',
        descricao: 'Criado automaticamente pelo sistema.',
      },
      {
        modulo_id: modulo?.id,
        nome: 'Visualizar Provimento',
        name: 'provimento-show',
        tabela: 'Provimento',
        operacao: 'Visualizar',
        descricao: 'Criado automaticamente pelo sistema.',
      },
      {
        modulo_id: modulo?.id,
        nome: 'Eliminar Provimento',
        name: 'provimento-delete',
        tabela: 'Provimento',
        operacao: 'Eliminar',
        descricao: 'Criado automaticamente pelo sistema.',
      },
      {
        modulo_id: modulo?.id,
        nome: 'Actualizar Provimento',
        name: 'provimento-update',
        tabela: 'Provimento',
        operacao: 'Actualizar',
        descricao: 'Criado automaticamente pelo sistema.',
      },
      {
        modulo_id: modulo?.id,
        nome: 'Registar Provimento',
        name: 'provimento-store',
        tabela: 'Provimento',
        operacao: 'Registar',
        descricao: 'Criado automaticamente pelo sistema.',
      }
    ]
    await Permission.createMany(provimento)
 
  }
}
