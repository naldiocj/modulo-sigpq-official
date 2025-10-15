import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Provimento extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({})
  public pessoa_fisica_id: number

  @column({})
  public patente_id: number

  @column({})
  public numero_despacho: number

  @column({})
  public data_provimento: Date

  @column({})
  public anexo: string

  @column({})
  public acto_progressao: string

  @column()
  public activo: boolean

  @column({})
  public user_id: number

  @column({})
  public descricao: string

  @column({})
  public eliminado: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
