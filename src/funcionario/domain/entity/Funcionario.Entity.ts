// import { Entity } from "@piips/core/domain"
// import { FuncionarioINPUT } from "../dto/FuncionarioDto"

// export default class FuncionarioEntity extends Entity<FuncionarioINPUT> {
export default class FuncionarioEntity {

  constructor(
    readonly id: number,
    readonly funcionario: {
      nip: string,
      user_id: string,
      data_adesao: Date,
      pseudomino: string,
      descricao: string,
      numero_agente: string,
      foto_efectivo: string,
      anexo_processo: string,
      numero_processo: string,
      sigpq_tipo_vinculo_id: string
    }
  ) {

  }

}
