import Database from '@ioc:Adonis/Lucid/Database';
import NotCreatedException from 'App/Exceptions/NotCreatedException';
// import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';

export default class RegistarRepository {
  // #baseRepo
  #table = "sigpq_eventos"

  constructor() {
    // this.#baseRepo = new BaseModuloRepository(this.#table)
  }

  public async execute(input: any): Promise<any> {

    const dateTime = new Date()

    const trx = await Database.transaction()
    try {

      if (!input.user_id) {
        return Error('Deve fazer sair terminar sessão e iniciar novamente para ter uma nova sessao')
      } 
       
      const evento = {
        pessoafisica_id: input.pessoafisica_id,
        sigpq_tipo_evento_id: Number(input.sigpq_tipo_evento_id),
        observacao: input.observacao,
        titulo: input.titulo,
        data: input.data,
        estado: input.estado,
        activo: input.activo,
        user_id: input.user_id,
        created_at: dateTime,
        updated_at: dateTime
      }

      await Database
        .insertQuery() // 👈 gives an instance of insert query builder
        .table(this.#table)
        .useTransaction(trx)
        .insert(evento)
      return await trx.commit()

    } catch (e) {
      await trx.rollback()
      console.log(e);
      throw new NotCreatedException(null);
    }

  }

  public async buscarNip(n:any) {
    return await Database.from(this.#table).where('nip', n).first()
  }

  public async buscarProcesso(n:any) {
    return await Database.from(this.#table).where('numero_processo', n).first()
  }

  public async buscarAgente(n:any) {
    return await Database.from(this.#table).where('numero_agente', n).first()
  }

}
