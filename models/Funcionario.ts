import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Funcionario extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({})
  public nip: number

  @column({})
  public pseudomino: string

  @column({})
  public data_adesao: number

  @column({})
  public foto_efectivo: Date

  @column({})
  public numero_processo: string

  @column({})
  public numero_agente: string

  @column({})
  public sigpq_tipo_vinculo_id: number

  @column({})
  public user_id: number

  @column({})
  public anexo_processo: string

  @column({})
  public descricao: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
