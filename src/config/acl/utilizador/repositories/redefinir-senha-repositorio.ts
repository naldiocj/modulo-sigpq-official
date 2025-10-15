

import Database from '@ioc:Adonis/Lucid/Database'
import UserHelper from 'App/Helper/UserHelper'

export default class RedefinirSenhaRepository {

  public async redefinirSenha(user: any): Promise<any> {

    const salt = new UserHelper();

    try {

      const buscarUtilizador = await Database.from({ u: 'users' })
        .where('u.id', user.id)
        .where('u.eliminado', false)
        .first()

      if (!buscarUtilizador) {
        return Error('Utilizador não encontrado !')
      }

      const newUser = await Database
        // .insertQuery() // 👈 gives an instance of insert query builder
        .from('users')
        .where('id', user.id)
        .update({
          ...user,
          password: await salt.generatePasswordWithSaltDefault(),
          forcar_alterar_senha: true,
          updated_at: new Date()
        })

      return newUser
    } catch (e) {
      console.log(e);
      return Error('Não foi possível redefinir a senha do utilizador.');
    }
  }

}
