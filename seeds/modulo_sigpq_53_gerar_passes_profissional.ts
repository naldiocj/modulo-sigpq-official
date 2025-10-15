import Database from '@ioc:Adonis/Lucid/Database'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Application from '@ioc:Adonis/Core/Application'
const pass = import(`${Application.appRoot}/addons/modulo-sigpq/src/gerar-passes/repositories/crud-base-repositorio`);


export default class extends BaseSeeder {
  public async run() {


    const { default: Rep } = await pass



    const funcionarios = await Database.from('sigpq_funcionarios').whereNotNull('nip');


    await new Rep().registar({ user_id: 1, agentes: funcionarios })

  }
}
