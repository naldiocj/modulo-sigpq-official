import { DateTime } from 'luxon'

export interface DTOTipoCursoInput {
  id?: number
  nome: string
  sigla: string
  activo: boolean
  user_id: number
  descricao?: string
  createdAt: DateTime
  updatedAt: DateTime
}
