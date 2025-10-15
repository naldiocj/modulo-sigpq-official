import Database from '@ioc:Adonis/Lucid/Database'

export default class Repository {
  async execute(id: any, user_id: any): Promise<any> {
    try {
      const result = await Database
        .from('sigpq_funcionario_chefias')
        .where('id', id)
        .update({
          eliminado: true,
          user_id
        })

      return result
    } catch (error) {
      console.log(error)
      return Error('Erro ao eliminar item.')
    }
  }
}
