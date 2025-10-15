import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class sigpq_acto_progressaos extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({})
  public nome: string

  @column({})
  public sigla: string

  @column({})
  public user_id: number

  @column()
  public activo?: boolean

  @column({})
  public descricao: string

  @column({})
  public eliminado?: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
