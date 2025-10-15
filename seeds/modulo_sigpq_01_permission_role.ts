import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'
// import Permission from 'App/Models/Permission'
import RolePermission from 'App/Models/RolePermission'
// import Modulo from 'App/Models/Modulo'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method

    const operador = await Role.findBy('name', 'operador') || { id: 3 }

    // Operador normal

    for (const item of [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26, 27]) {
      await RolePermission.create({ role_id: operador.id, permission_id: item })
    }
  }
}
