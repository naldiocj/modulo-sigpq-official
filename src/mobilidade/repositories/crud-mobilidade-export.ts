import CrudBaseRepository from "./crud-base-repositorio";

export default class CrudBaseMobilidadeRepository {
  #mobilidade: CrudBaseRepository
  constructor() {
   this.#mobilidade = new CrudBaseRepository()
  }

  get api()
  {
    return this.#mobilidade
  }
}
