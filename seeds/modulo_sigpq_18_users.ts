import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Pessoa from 'App/Models/Pessoa';
import Pessoafisica from 'App/Models/Pessoafisica';
import User from 'App/Models/User'
import UserRole from 'App/Models/UserRole'

export default class extends BaseSeeder {
  public async run() {

    // Write your database queries inside the run method

    const operador = 3 // Operador para DPQ (DIRECÇÃO DE PESSOAL E QUADROS)
  
    //Gil Famoso Sebastião da Silva
    const p1 = await Pessoa.create({
      nome_completo: 'Gil Famoso Sebastião da Silva',
      numero_ordem: 110,
      user_id: 2,
      tipo: 'pf'
    })

    const u1 = await User.create({
      username: 'gil.silva',
      email: 'gil.dasilva@pn.gov.ao',
      password: '12345678',
      pessoa_id: p1.id,
      descricao: 'Criado automaticamente pelo sistema.'
    })

    await Pessoafisica.create({
      id: p1.id,
      apelido: 'XXX',
      genero: 'M',
      nome_pai: 'XXX',
      nome_mae: 'XXX',
      data_nascimento: new Date('2000-01-01'),
      nacionalidade_id: 1,
      estado_civil_id: 1,
      regime_id: 1
    });

    await UserRole.create({
      user_id: u1.id,
      role_id: operador
    });

    // Luís Rodrigo António
    const p2 = await Pessoa.create({
      nome_completo: 'Luís Rodrigo António',
      numero_ordem: 111,
      user_id: 2,
      tipo: 'pf'
    })
    
    const u2 = await User.create({
      username: 'luis.antonio',
      email: 'luis.antonio@pn.gov.ao',
      password: '12345678',
      pessoa_id: p2.id,
      user_id: 2,
      descricao: 'Criado automaticamente pelo sistema.'
    })

    await Pessoafisica.create({
      id: p2.id,
      apelido: 'XXX',
      genero: 'M',
      nome_pai: 'XXX',
      nome_mae: 'XXX',
      data_nascimento: new Date('2000-01-01'),
      nacionalidade_id: 1,
      estado_civil_id: 1,
      regime_id: 1
    });

    await UserRole.create({
      user_id: u2.id,
      role_id: operador
    });

    // André dos Santos Bizerra do Nascimento
    const p3 = await Pessoa.create({
      nome_completo: 'André dos Santos Bizerra do Nascimento',
      numero_ordem: 112,
      user_id: 2,
      tipo: 'pf'
    })
    
    const u3 = await User.create({
      username: 'andre.nascimento',
      email: 'andre.nascimento@pn.gov.ao',
      password: '12345678',
      pessoa_id: p3.id,
      user_id: 2,
      descricao: 'Criado automaticamente pelo sistema.'
    })

    await Pessoafisica.create({
      id: p3.id,
      apelido: 'XXX',
      genero: 'F',
      nome_pai: 'XXX',
      nome_mae: 'XXX',
      data_nascimento: new Date('2000-01-01'),
      nacionalidade_id: 1,
      estado_civil_id: 1,
      regime_id: 1
    });

    await UserRole.create({
      user_id: u3.id,
      role_id: operador
    });

    // Renato Luís Geraldo Manuel
    const p4 = await Pessoa.create({
      nome_completo: 'Renato Luís Geraldo Manuel',
      numero_ordem: 112,
      user_id: 2,
      tipo: 'pf'
    })
    
    const u4 = await User.create({
      username: 'renato.manuel',
      email: 'renato.manuel@pn.gov.ao',
      password: '12345678',
      pessoa_id: p4.id,
      user_id: 2,
      descricao: 'Criado automaticamente pelo sistema.'
    })

    await Pessoafisica.create({
      id: p4.id,
      apelido: 'XXX',
      genero: 'M',
      nome_pai: 'XXX',
      nome_mae: 'XXX',
      data_nascimento: new Date('2000-01-01'),
      nacionalidade_id: 1,
      estado_civil_id: 1,
      regime_id: 1
    });

    await UserRole.create({
      user_id: u4.id,
      role_id: operador
    });

    // Wilson Valdemar dos Santos Domingos
    const p5 = await Pessoa.create({
      nome_completo: 'Wilson Valdemar dos Santos Domingos',
      numero_ordem: 113,
      user_id: 2,
      tipo: 'pf'
    })
    
    const u5 = await User.create({
      username: 'wilson.domingos',
      email: 'wilson.domingos@pn.gov.ao',
      password: '12345678',
      pessoa_id: p5.id,
      user_id: 2,
      descricao: 'Criado automaticamente pelo sistema.'
    })

    await Pessoafisica.create({
      id: p5.id,
      apelido: 'XXX',
      genero: 'M',
      nome_pai: 'XXX',
      nome_mae: 'XXX',
      data_nascimento: new Date('2000-01-01'),
      nacionalidade_id: 1,
      estado_civil_id: 1,
      regime_id: 1
    });

    await UserRole.create({
      user_id: u5.id,
      role_id: operador
    });

    // José de Lima
    const p6 = await Pessoa.create({
      nome_completo: 'Eugénio Manuel Cuca',
      numero_ordem: 114,
      user_id: 2,
      tipo: 'pf'
    })
    
    const u6 = await User.create({
      username: 'eugenio.cuca',
      email: 'eugenio.cuca@pn.gov.ao',
      password: '12345678',
      pessoa_id: p6.id,
      user_id: 2,
      descricao: 'Criado automaticamente pelo sistema.'
    })

    await Pessoafisica.create({
      id: p6.id,
      apelido: 'XXX',
      genero: 'M',
      nome_pai: 'XXX',
      nome_mae: 'XXX',
      data_nascimento: new Date('2000-01-01'),
      nacionalidade_id: 1,
      estado_civil_id: 1,
      regime_id: 1
    });

    await UserRole.create({
      user_id: u6.id,
      role_id: operador
    });

    // William Pascoal
    const p7 = await Pessoa.create({
      nome_completo: 'William Pascoal',
      numero_ordem: 107,
      user_id: 2,
      tipo: 'pf'
    })
    
    const u7 = await User.create({
      username: 'teresa.teixeira',
      email: 'teresa.teixeira@pn.gov.ao',
      password: '12345678',
      pessoa_id: p7.id,
      user_id: 2,
      descricao: 'Criado automaticamente pelo sistema.'
    })

    await Pessoafisica.create({
      id: p7.id,
      apelido: 'XXX',
      genero: 'F',
      nome_pai: 'XXX',
      nome_mae: 'XXX',
      data_nascimento: new Date('2000-01-01'),
      nacionalidade_id: 1,
      estado_civil_id: 1,
      regime_id: 1
    });

    await UserRole.create({
      user_id: u7.id,
      role_id: operador
    });
  }
}
