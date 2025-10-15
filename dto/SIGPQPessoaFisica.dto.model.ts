import { DateTime } from "luxon"

type Genero = 'M' | 'F'
type Estado = 'Activo' | 'Inactivo' | 'Falecido' | 'Pré-Reforma' | 'Reforma'

export interface DTOPessoaFisica {
  id?: number
  foto_civil?: string
  apelido: string
  genero: Genero
  nome_mae?: string
  nome_pai?: string
  data_nascimento: Date
  estado: Estado
  iban?: string
  nacionalidade_id?: number
  estado_civil_id: number
  regime_id: number
  createdAt?: DateTime
  updatedAt?: DateTime
}