import { DateTime } from "luxon"

type Tipo = 'pf' | 'pj'

export interface DTOPessoa {
  id?: number
  numero_ordem?: number
  nome_completo: string
  email_pessoal?: string
  tipo: Tipo
  activo?: boolean
  user_id?: number
  createdAt?: DateTime
  updatedAt?: DateTime
}
