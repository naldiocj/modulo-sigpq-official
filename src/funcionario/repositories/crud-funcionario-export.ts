import CrudBaseRepository from "../repositories/crud-base-repositorio"


export default class CrudBaseFuncionarioRepository {
  #funcionario: CrudBaseRepository
  constructor() {
   this.#funcionario = new CrudBaseRepository()
  }

  get api()
  {
    return this.#funcionario
  }
}
