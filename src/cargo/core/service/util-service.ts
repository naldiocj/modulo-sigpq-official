import Database from "@ioc:Adonis/Lucid/Database"
import * as  situacao from "../constants/constant"
import BaseRepository from "App/@piips/core/repository/BaseRepository"

const validarFuncaoActual = require('./../../validation/actual-validar')
const validarFuncaoExercida = require('./../../validation/exercida-validar')

interface IInput {
  pessoafisica_id: string
  pessoajurifica_id: string,
  situacao: string,
  activo?: boolean | number
  data_inicio: Date
  data_fim?: Date
  sigpq_tipo_funcao_id: number
}


// const funcaoRepository = new BaseRepository<IInput>('sigpq_funcaos');

export async function validar(input: IInput, trx: any = null) {


  const valido = input.situacao == situacao.ACTUAL ? validarFuncaoActual(input) : validarFuncaoExercida(input)
  try {


    if (input.situacao == situacao.ACTUAL) {
      await setExercida(input.data_inicio, trx)

    } else if (input.situacao == situacao.EXERCIDA) {
      if (dataValida(input.data_inicio, input.data_fim)) {
        valido.activo = false;
      } else {
        throw new Error('A data de inicio não deve ser superior a data de fim')
      }
    }
    return valido
  } catch (e) {
    throw new Error('Não foi possível realizar o registo')
  }
}

async function setExercida(data: any, trx: any = null): Promise<any> {

  try {
    await Database.from('sigpq_funcaos').where('situacao', situacao.ACTUAL).useTransaction(trx).update({
      data_fim: data,
    })

    await Database.from('sigpq_funcaos').useTransaction(trx).update({
      activo: false,
      situacao: 'exercida'
    })

  } catch (e) {
    console.log(e)
    return Error('Não foi possível realizar o registo')
  }
}


function dataValida(primeira_data: any, segunda_data: any): boolean {
  const data_inicio: Date = new Date(primeira_data)
  const data_fim: Date = new Date(segunda_data)


  if (data_fim > data_inicio) {
    return true
  } else {
    return false
  }

}
