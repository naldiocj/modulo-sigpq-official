import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';

export default class Repository {
  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository('sigpq_tipo_eventos')
  }

  public async listarTodos(options: any): Promise<any> {

    try {

      return await this.#baseRepo.listarTodos(options)

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

}
