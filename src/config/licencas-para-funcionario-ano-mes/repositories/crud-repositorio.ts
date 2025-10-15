import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import BaseModuloRepository from '../../../../../../app/Repositories/modulo/BaseModuloRepository'
import InternalServerException from '../../../../../../app/Exceptions/InternalServerException';

const validar = require('./../validation/validar')

interface IInput {
  user_id: number
  anexo: string
  tipo_licenca_id:number
  pessoafisica_id:number
  situacao:string
  mes:string
  ano:string
  motivo:string
  resposta:string
}

/* const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_funcionario_licencas'); */

export default class CrudLicencaAnoMesRepository {

  #tabela = 'sigpq_funcionario_licencas_ano_mes'; // Nome da tabela
  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository(this.#tabela)
  }

  public async registar(input: IInput, trx = null): Promise<any> {

    const valido = validar(input)
    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }
       let result:any
      try{
          const searchCriteria = [
            { field: "pessoafisica_id", value: input.pessoafisica_id },
            { field: "ano", value: input.ano},
            { field: "mes", value: input.mes},
            { field: "tipo_licenca_id", value: input.tipo_licenca_id },
          ];
          const findOne=await this.#baseRepo.findByOne(searchCriteria)
          if(!findOne)result= await this.#baseRepo.registar(valido,trx)
        return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo Licenças Mês e Ano ano para Funcionário.');
    }
  }


  public async editar(id: any,input: IInput, trx = null): Promise<any> {


    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {
       const result= await this.#baseRepo.editar(input,id,trx)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo Licenças Mês e Ano para Funcionário.');
    }
  }



  public async delete(id: any,auth: any, trx = null): Promise<any> {

    try {
       const result= await this.#baseRepo.delete(id,trx,auth.user.id)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível eliminar o dia em Licenças para Funcionário Mês e Ano.');
    }
  }



  public async listarTodos(options: any): Promise<any> {

    try {

      let query: DatabaseQueryBuilderContract = Database.from({ f: 'sigpq_funcionarios' })
        .select(
          // ...options.valoresSelecionados,
          'p.nome_completo',
          'p.activo',
          'pj.sigla',
          // Database.raw(`CASE WHEN p.activo = 1 THEN 'sim' ELSE false END as activo`),
          'pf.apelido',
          'pf.genero',
          'pf.estado',
          'f.nip',
          'f.numero_processo',
          'f.numero_agente',
          'f.foto_efectivo',
          'f.id',
          'patentes.nome as patente_nome',
          Database.raw("CONCAT(p.nome_completo, ' ', COALESCE(pf.apelido, '')) as nome_completo_apelido"),
          Database.raw("DATE_FORMAT(pf.data_nascimento, '%d/%m/%Y') as data_nascimento"),
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        .innerJoin('pessoas as p', 'p.id', 'f.id')
        .innerJoin('pessoafisicas as pf', 'pf.id', 'f.id')
        .innerJoin('sigpq_funcionario_licencas_ano_mes as s','s.pessoafisica_id','pf.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'p.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'p.id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'sigpq_funcionario_orgaos.pessoajuridica_id')
        .where('sigpq_provimentos.activo', true)

        .where('sigpq_provimentos.eliminado', false)
        .where('sigpq_funcionario_orgaos.activo', true)
        .where('sigpq_funcionario_orgaos.eliminado', false)

        // .where('f.sigpq_tipo_vinculo_id', 1) // efectivo
        // .where('fo.pessoajuridica_id', 1)
        .where('p.eliminado', false)
        .orderBy('p.nome_completo', 'asc')


      if (!options.user.aceder_todos_agentes) {
        query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
      }

      if (options.pessoaEstadoId) {
        query.where('pf.estado', options.pessoaEstadoId)
      }

      if (options.regimeId) {
        query.where('pf.regime_id', Number(options.regimeId))
      }

      if (options.ano) {
        query.whereRaw('YEAR(s.dia_selecionado) = ?', [options.ano]);
      }

      if (options.mes) {
        query.whereRaw('MONTH(s.dia_selecionado) = ?', [options.mes]);
      }

      if (options.tipo_licenca_id) {
        query.where('s.tipo_licenca_id',options.tipo_licenca_id)
      }

      if (options.patenteId) {
        query.where('patentes.id', Number(options.patenteId))
      }

      if (options.tipoVinculoId) {
        query.where('f.sigpq_tipo_vinculo_id', Number(options.tipoVinculoId))
      }

      if (options.tipoOrgaoId) {
        query.whereLike('pj.orgao_comando_provincial', options.tipoOrgaoId)
      }

      // if (options.aceder_todos_agentes) {
      if (options.orgaoId) {
        query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgaoId)
      } else {
        // query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
      }

      if (options.genero) {
        query.where('pf.genero', options.genero)
      }

      if (options.patenteClasse) {
        query.where('patentes.sigpq_tipo_carreira_id', options.patenteClasse)
      }


      return await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async listarTodos_sem_pessoas(options: any): Promise<any> {
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_funcionario_licencas_ano_mes' })
        .select(
          's.*',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAtt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAtt")
        )
        .where('s.eliminado', false)

      if (options.pessoafisica_id) {
        query.where('s.pessoafisica_id',options.pessoafisica_id)
      }

      if (options.ano) {
        query.where('s.ano', options.ano);
      }

      if (options.mes) {
        query.where('s.mes', options.mes);
      }

      if (options.tipo_licenca_id) {
        query.where('s.tipo_licenca_id',options.tipo_licenca_id)
      }

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }



  public async updateMany(items: any[], ids: number[], trx: any = null): Promise<any> {

    const dateTime = new Date(); // Data atual
    try {
        const query = trx ? trx : Database;
        const promises = ids.map(id => {
            const value = {
                ...items.find(item => item.id == id), // Encontra o item correspondente
                updated_at: dateTime,
            };
            return query
                .query()
                .from(this.#tabela)
                .where("id", id)
                .update(value);
        });

        // Aguarda todas as promessas de atualização serem resolvidas
        return await Promise.all(promises);
    } catch (e) {
        console.log(e);
        throw new InternalServerException();
    }
}


}
