import { DateTime } from 'luxon'

export interface DTOFuncionario {
  id?: number
  nip?: string
  numero_processo?: string
  numero_agente?: string
  pseudomino: string
  sigpq_tipo_sanguineo_id?: number
  sigpq_tipo_vinculo_id: number
  data_adesao: Date
  foto_efectivo?: string
  descricao?: string
  createdAt?: DateTime
  updatedAt?: DateTime
}
