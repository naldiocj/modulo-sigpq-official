import CrudBaseRepository from "../repositories/crud-repositorio"


export default class CrudBaseTipoLicencaRepository {
  #tipoLicenca: CrudBaseRepository
  constructor() {
   this.#tipoLicenca = new CrudBaseRepository()
  }

  get api()
  {
    return this.#tipoLicenca
  }
}
