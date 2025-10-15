import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'
import BaseModuloRepository from '../../../../../../app/Repositories/modulo/BaseModuloRepository'
import InternalServerException from '../../../../../../app/Exceptions/InternalServerException';
import CrudLicencaAnoMesRepository from '../../licencas-para-funcionario-ano-mes/repositories/crud-repositorio';
import OrgaoCrudBaseRepository from './../../../config/direcao-ou-orgao/repositories/crud-base-repositorio';
import {DateTime} from 'luxon'
const validar = require('./../validation/validar')
const validarMultiplo = require('./../validation/validarMultiplo')
const validarLicencaAnoMes = require('./../validation/validarLicencaAnoMes')

interface IInputDay{
  day:string,
  descricao:string;
}
interface IInput {
  user_id: number
  descricao?: string
  estado?:string
  tipo_licenca_id:number
  pessoafisica_id:number
  dias_maximos:string
  dia_selecionado:string
  motivo:String
  resposta:String
  situacao?:string
  mes?:string
  ano?:string
  dias_selecionados?:IInputDay[]
  feriados:string[]
  dias_selecionados_para_nao_fazer_parte:string[]
}

/* const tipoFuncaoRepository = new BaseRepository<IInput>('sigpq_funcionario_licencas'); */

export default class CrudLicencaRepository {

  #tabela = 'sigpq_funcionario_licencas'; // Nome da tabela
  #baseRepo
  #licencaAnoMes
  #orgaoCrudBaseRepository: any
  constructor() {
    this.#baseRepo = new BaseModuloRepository(this.#tabela)
    this.#licencaAnoMes=new CrudLicencaAnoMesRepository()
    this.#orgaoCrudBaseRepository = new OrgaoCrudBaseRepository();
  }




  async calcularDiasUteis(
    mes: number,
    ano: number,
    diasUteisDesejados: number,
    feriados: string[],
    dias_selecionados_para_nao_fazer_parte: string[]
): Promise<IInputDay[]> {
    const diasUteis: IInputDay[] = [];


    const existeNoArray = (data, array) => {
      return array.includes(data);
  };
    // Começa com o primeiro dia do mês
    let diaAtual = DateTime.local(ano, mes, 1);

    while (diasUteis.length < diasUteisDesejados) {
        // Verifica se o dia atual é um dia útil
        const diaString = diaAtual.toISODate(); // Formato YYYY-MM-DD
        const diaSemana = diaAtual.weekday; // 1 (segunda) a 7 (domingo)

        // Verificar se é dia útil (não fim de semana, não feriado e não está na lista de exclusão)
        if(!diaString) continue
        if (diaSemana !== 6 && diaSemana !== 7 &&
            !existeNoArray(diaString,feriados) &&
            !existeNoArray(diaString,dias_selecionados_para_nao_fazer_parte)) {
            diasUteis.push({ day: diaString, descricao: "pendente" });
        }

        // Avançar para o próximo dia
        diaAtual = diaAtual.plus({ days: 1 });

        // Verificar se ultrapassou o limite do ano
        if (diaAtual.year > ano) {
            break;
        }
    }
    return diasUteis; // Retorna a lista de dias úteis encontrados
}


  public async registarLicencaAnoMes(input: IInput, trx = null): Promise<any> {
    const _result= await this.#licencaAnoMes.registar(input,trx)
  }

  public async enviar_detalhe_para_licenca_ano_mes(input: IInput, trx = null): Promise<any> {
    const valido = validarLicencaAnoMes(input)
    const _result= await this.pegarDadosDaLicenca_Ano_mes(valido)
    const result= _result[0]?.id?await this.#licencaAnoMes.editar(_result[0].id,valido):await this.registarLicencaAnoMes(input,trx)
  }

  public async pegarDadosDaLicenca_Ano_mes(input: any, trx = null)
  {
    try {
      const valido = validarLicencaAnoMes(input)
    const _result= await this.#licencaAnoMes.listarTodos_sem_pessoas(valido)
    return _result
    } catch (error) {
      console.log(error);
      return Error('Não foi possível listar os dados.');
    }
  }

  public async registar(input: IInput, trx = null): Promise<any> {
    const valido = validarMultiplo(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    await this.registarLicencaAnoMes(input,trx)

 //if(input.tipo_licenca_id==41)input.dias_selecionados=await this.calcularDiasUteis(Number(input.mes),Number(input.ano),Number(input.dias_maximos),input.feriados,input.dias_selecionados_para_nao_fazer_parte)
    try {
      if(input.dias_selecionados)
      {
        let result;
        let eventoEmArray;
        await this.converterDadosParaArray(input.dias_selecionados).then(
          (results)=>{
            eventoEmArray=results;
          }
        )
        eventoEmArray.forEach(async(dia_selecionado) => {
          const diaSelecionadoDateTime = DateTime.fromISO(dia_selecionado.day);
          const dataInsert={
            user_id: input.user_id,
            descricao:'pendente', //dia_selecionado.descricao
            estado:input.estado,
            tipo_licenca_id:input.tipo_licenca_id,
            pessoafisica_id:input.pessoafisica_id,
            dia_selecionado:diaSelecionadoDateTime.toISODate(),
            situacao:input.situacao
          }
          const searchCriteria = [
            { field: "pessoafisica_id", value: dataInsert.pessoafisica_id },
            { field: "dia_selecionado", value: dia_selecionado.day},
            { field: "tipo_licenca_id", value: dataInsert.tipo_licenca_id },
            // { field: "situacao", value: "pendente" },
          ];
          const findOne=await this.#baseRepo.findByOne(searchCriteria)
          if(!findOne)result= await this.#baseRepo.registar(dataInsert,trx)
        });
        return result
      }
      return Error('Não foi possível criar um novo Licenças para Funcionário. Envie os dias selecionados');
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo Licenças para Funcionário.');
    }
  }

  public async converterDadosParaArray(dias_selecionados:any[])
  {
    let diasSelecionados:any = [];

          if (typeof dias_selecionados === 'string') {
            try {
              diasSelecionados = JSON.parse(dias_selecionados);
            } catch (error) {
              console.error('Erro ao fazer parse de dias_selecionados:', error);
            }
          } else if (Array.isArray(dias_selecionados)) {
            diasSelecionados = dias_selecionados;
          }

          return diasSelecionados;
  }

  public async editar(id: any,input: IInput, trx = null): Promise<any> {


    const valido = validar(input)

    if (['string'].includes(typeof valido)) {
      return Error(valido);
    }

    try {
       const result= await this.#baseRepo.editar(valido,id,trx)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível criar um novo Licenças para Funcionário.');
    }
  }

  public async alterarSituacao(input: any, trx = null): Promise<any> {
    let diasSelecionados;
    let itemsToUpdate;
    let idsToUpdate;
    try {
        // Tentar parsear o JSON e garantir que diasSelecionados seja um array
        diasSelecionados = JSON.parse(input.dias_selecionados);
        // Caso o JSON contenha apenas um único objeto, converta para um array
        if (!Array.isArray(diasSelecionados)) {
            diasSelecionados = [diasSelecionados];
        }
    } catch (error) {
        throw new Error('Não foi possível aprovar este dia');
    }
    // Preparar os dados para atualização
     itemsToUpdate = diasSelecionados.map(dia_selecionado => ({
        id: dia_selecionado.id, // ID do registro a ser atualizado
        descricao: dia_selecionado.descricao,
        situacao: input.situacao,
        motivo_rejeicao: input.motivo_rejeicao,
        situacao_made_by: input.user_id,
        situacao_made_at: new Date().toISOString().split("T")[0]
    }));

    // Extrair apenas os IDs para passar para a função updateMany
    idsToUpdate = itemsToUpdate.map(item => item.id);
    try {
        // Chama a função updateMany com os dados preparados
        const resultados = await this.updateMany(itemsToUpdate, idsToUpdate, trx);
        return resultados; // Retorna os resultados da atualização
    } catch (error) {
        console.log(error);
        throw new Error('Não foi possível atualizar as Licenças para Funcionário.'+"Eviando daddos: "+itemsToUpdate+"Ids: "+idsToUpdate);
    }
}


  public async delete(id: any,auth: any, trx = null): Promise<any> {

    try {
       const result= await this.#baseRepo.delete(id,trx,auth.user.id)
      return result
    } catch (e) {
      console.log(e);
      return Error('Não foi possível eliminar o dia em Licenças para Funcionário.');
    }
  }


  public async listarTodos_ComPessoas_E_Licencas(options:any):Promise<any>
  {  
    
      try { 
              

        let query: DatabaseQueryBuilderContract = Database.from({ f: 'sigpq_funcionarios' })
          .select(
            Database.raw("upper(p.nome_completo) as nome_completo"),
            'p.activo',
            'pj.sigla',
            Database.raw("upper(pf.apelido) as apelido"),
            'pf.genero',
            // 'pf.estado',
            'f.nip',
            'f.numero_processo',
            'f.numero_agente',
            'f.foto_efectivo',
            'f.id',
            'fe.duracao_inatividade',
            'fe.sigpq_estado_id',
            'fe.sigpq_situacao_id',
            'fe.sigpq_estado_reforma_id',
            'situacao_estado.nome as nome_fora_atividade',
            'es.nome as motivo_desistencia',
            'regimes.quadro',
            Database.raw('upper(se.nome) as estado'),
            'patentes.nome as patente_nome',
            Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
            Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
            Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"),
            Database.raw("DATE_FORMAT(fe.data_inicio_inatividade, '%d/%m/%Y %H:%i:%s') as data_inicio_inatividade")
          )
          .innerJoin('pessoas as p', 'p.id', 'f.id')
          .innerJoin('sigpq_funcionario_licencas as s','s.pessoafisica_id','p.id')
          .innerJoin('sigpq_tipos_licencas as licenca','s.tipo_licenca_id','licenca.id')
          .innerJoin('pessoafisicas as pf', 'pf.id', 'f.id')
          .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'p.id')
          .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
          .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'p.id')
          .innerJoin('pessoajuridicas as pj', 'pj.id', 'sigpq_funcionario_orgaos.pessoajuridica_id')
          .innerJoin('regimes', 'regimes.id', 'pf.regime_id')
          .innerJoin('sigpq_funcionario_estados as fe', 'fe.pessoafisica_id', 'f.id')
          .innerJoin('sigpq_situacao_estados as se', 'se.id', 'fe.sigpq_situacao_id')
          .leftJoin('sigpq_estados as situacao_estado', 'situacao_estado.id', 'fe.sigpq_estado_id')
          .leftJoin('sigpq_estados as es', 'es.id', 'fe.sigpq_estado_reforma_id')


          .where('sigpq_provimentos.activo', true)
          // .where('pf.estado', 'activo')
          .where('sigpq_provimentos.eliminado', false)
          .where('sigpq_funcionario_orgaos.activo', true)
          .where('sigpq_funcionario_orgaos.eliminado', false)
          .where('sigpq_funcionario_orgaos.nivel_colocacao', 'muito-alto')
          // .where('c.activo', true)

          .where('p.eliminado', false)




          .where((query: any) => {
            if (options.idadeMenos || options.idadeMais) {
              if (options.idadeMenos == options.idadeMais) {
                query.whereRaw(`
                    CASE
                      WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                         TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) > ${options.idadeMenos}
                    END
                  `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) = ' + options.idadeMenos)
              } else if (options.idadeMenos < options.idadeMais) {
                query.whereRaw(`
                  CASE
                    WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMenos} and  TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) <= ${options.idadeMais}
                  END
                `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) >= ' + options.idadeMenos + ' and (YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) <= ' + options.idadeMais)
              } else if (options.idadeMenos && !options.idadeMais) {
                query.whereRaw(`
                  CASE
                    WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMenos}
                  END
                `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) >= ' + options.idadeMenos)

              } else if (!options.idadeMenos && options.idadeMais && options.idadeMais > 18) {
                query.whereRaw(`
                  CASE
                    WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= 18 and TIMESTAMPDIFF(YEAR, pessoasfisicas.data_nascimentom CURDATE()) <= ${options.idadeMais}
                  END
                `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(pf.data_nascimento AS DATE))) >=18 and (YEAR(NOW()) - YEAR(pf.data_nascimento)) <= ' + options.idadeMais)
              } else if (options.idadeMenos > options.idadeMais) {
                query.whereRaw(`
                  CASE
                    WHEN DATE(pf.data_nascimento) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, pf.data_nascimento, CURDATE()) >= ${options.idadeMais}
                  END
                `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(CAST(sigpq_provimentos.data_provimento AS DATE))) >= ' + options.idadeMenos)
              }
            }
          })
          .where((query: any) => {
            if (options.anoMenos || options.anoMais) {

              if (options.anoMenos == options.anoMais) {
                query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) = ${options.anoMenos}
                  END
                `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) = ' + options.anoMenos)
              } else if (options.anoMenos < options.anoMais) {

                query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos} and TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) <= ${options.anoMais}
                  END
                `)

                // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos + ' and (YEAR(NOW()) - YEAR(DATE(f.data_adesao))) <= ' + options.anoMais)
              } else if (options.anoMenos && !options.anoMais) {

                query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
                  END
                `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos)

              } else if (!options.anoMenos && options.anoMais && options.anoMais > 18) {
                query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= 18 and TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) <= ${options.anoMais}
                  END
                `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >=18 and (YEAR(NOW()) - YEAR(f.data_adesao)) <= ' + options.anoMais)
              } else if (options.anoMenos > options.anoMais) {
                query.whereRaw(`
                  CASE
                    WHEN DATE(f.data_adesao) < CURDATE() THEN
                       TIMESTAMPDIFF(YEAR, f.data_adesao, CURDATE()) >= ${options.anoMenos}
                  END
                `)
                // query.whereRaw('(YEAR(NOW()) - YEAR(DATE(f.data_adesao))) >= ' + options.anoMenos)
              }
            }
          })
          .where((query: any) => {
            if (options.regimeId) {
              query.where('pf.regime_id', Number(options.regimeId))
            }

          })
          .where((query: any) => {
            if (options.patenteId) {
              query.where('patentes.id', Number(options.patenteId))
            }
          })
          .where((query: any) => {

            if (options.tipoVinculoId) {
              query.where('f.sigpq_tipo_vinculo_id', Number(options.tipoVinculoId))
            }
          })
          .where((query: any) => {

            if (options.tipoOrgao_id) {
              query.whereLike('pj.orgao_comando_provincial', options.tipoOrgao_id)
            }
          })
          .where((query: any) => {

            if (options.aceder_todos_agentes) {
              if (options.orgaoId) {
                query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgaoId)
              }
              if (options.tipoOrgaoId) {
                query.where('pj.tipo_estrutura_organica_sigla', options.tipoOrgaoId)
              }

            } else {
              query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
            }
          })
          .where((query: any) => {
            if (options.genero) {
              query.where('pf.genero', options.genero)
            }

          })

          .where((query: any) => {
            if (options.estadoId) {
              query.where('fe.sigpq_estado_id', options.estadoId)
            }

          })
          .where((query: any) => {
            if (options.situacaoId) {
              query.where('fe.sigpq_situacao_id', options.situacaoId)
            }

          })

          .where((query: any) => {
            if (options.forcaPassiva) {
              query.where('fe.sigpq_situacao_id', '<>', options.forcaPassiva)
            }
            
            if(options.licenca_disciplinar)
            {

              query.where('licenca.nome', 'like', `%Disciplinar%`)// Somente licença disciplinar
              
            }else{
              
              query.whereNot('licenca.nome', 'like', `%Disciplinar%`)
            }

            if(options.situacao_do_dia_da_licenca)
              {
                query.where('s.situacao',`${options.situacao_do_dia_da_licenca}`)
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

          })


          .where((query: any) => {

            if (options.dashboard) {
              if (options.patenteClasse) {
                query.where('patentes.sigpq_tipo_carreira_id', options.patenteClasse)
              }
            }
          })

          .where(function (item: any): void {

            if (options.search) {


              item.orWhere('p.nome_completo', 'like', `%${options.search}%`)
              item.orWhere('pf.apelido', 'like', `%${options.search}%`)

              // item.orWhere('tc.nome', 'like', `%${options.search}%`)
              // item.orWhere('es.nome', 'like', `%${options.search}%`)
              item.orWhere('se.nome', 'like', `%${options.search}%`)
              item.orWhere('f.nip', 'like', `%${options.search}%`)
              item.orWhere('f.numero_processo', 'like', `%${options.search}%`)
              item.orWhere('f.numero_agente', 'like', `%${options.search}%`)
              item.orWhereRaw("concat(p.nome_completo, ' ',pf.apelido) like ?", `%${options.search}%`)

              const date = new Date(options.search);
              if (!isNaN(date.getTime())) {
                const [day, month, year] = options.search.split('/');

                let data = ""
                if (day && month && year) {
                  data = `${year}-${month}-${day}`
                } else if (day && month) {
                  data = `${month}-${day}`
                } else {
                  data = day
                }
                item.orWhere('p.created_at', 'like', `%${data}%`)
              }

            }
          })

          .distinct('s.pessoafisica_id')

        if (options.page) {
          const pagination = await query.paginate(options.page, options.perPage || 10);

          pagination['rows'] = await Promise.all(pagination['rows'].map(async (item: any) => {
            const documento = await Database.from({ f: 'sigpq_documentos' })
              .select(
                'id',
                'nid',
                'data_emissao',
                'data_expira'
              )
              .whereNotIn('f.nid', ['Pessoal', 'Profissional'])
              .where('f.pessoafisica_id', item?.id)
              .where('f.eliminado', false)
              .first()

            return {
              ...item,
              orgao: await this.#orgaoCrudBaseRepository.listarPorPessoa(item?.id),
              documento
            };
          }));

          return pagination;
        } else {
          const items = await query;

          const all = await Promise.all(items.map(async (item: any) => {
            const documento = await Database.from({ f: 'sigpq_documentos' })
              .select(
                'id',
                'nid',
                'data_emissao',
                'data_expira'
              )
              .whereNotIn('f.nid', ['Pessoal', 'Profissional'])
              .where('f.pessoafisica_id', item?.id)
              .where('f.eliminado', false)
              .first()
            return {
              ...item,
              orgao: await this.#orgaoCrudBaseRepository.listarPorPessoa(item?.id),
              documento
            };
          }));
          return all;
        }

      } catch (e) {
        console.log(e);
        return Error('Não foi possível listar os registos.');
      }

    }

  public async listarTodosComPessoas(options: any): Promise<any> {

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
        .innerJoin('sigpq_funcionario_licencas as s','s.pessoafisica_id','pf.id')
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
        .where('s.eliminado', false)
        .orderBy('p.nome_completo', 'asc')
        .distinct('s.pessoafisica_id')


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

  public async listarTodos(options: any): Promise<any> {
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_funcionario_licencas' })
        .select(
          's.*',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAtt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAtt")
        )
        .where('s.eliminado', false)
        //.innerJoin('sigpq_tipos_licencas', 'sigpq_tipos_licencas.id', 'sigpq_funcionario_licencas.tipo_licenca_id')

       // query.where('fe.nome'.toUpperCase(),'falta'.toUpperCase())


        if (options.estado) {
          query.where('s.situacao',options.estado)
        }
      if (options.pessoafisica_id) {
        query.where('s.pessoafisica_id',options.pessoafisica_id)
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

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }
  public async listarTodasFerias(options: any): Promise<any> {
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_funcionario_licencas' })
        .select(
          's.*',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAtt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAtt")
        )
        .where('s.eliminado', false)
        .orderBy('s.dia_selecionado')
        //.innerJoin('sigpq_tipos_licencas', 'sigpq_tipos_licencas.id', 'sigpq_funcionario_licencas.tipo_licenca_id')

       // query.where('fe.nome'.toUpperCase(),'falta'.toUpperCase())

       query.where('s.situacao','aprovado')


      if (options.pessoafisica_id) {
        query.where('s.pessoafisica_id',options.pessoafisica_id)
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

      return options.page
        ? await query.paginate(options.page, options.perPage || 10)
        : await query

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }


  public async saberDiasDeFerias(options: any): Promise<any> {
    try {

      let query: DatabaseQueryBuilderContract = Database.from({ s: 'sigpq_funcionario_licencas' })
        .select(
          's.*',
          Database.raw("DATE_FORMAT(s.created_at, '%d/%m/%Y %H:%i:%s') as createdAtt"),
          Database.raw("DATE_FORMAT(s.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAtt")
        )
        .where('s.eliminado', false)

      if (options.tipo_licenca_id) {
        query.where('s.tipo_licenca_id',options.tipo_licenca_id)
      }

      if (options.pessoafisica_id) {
        query.where('s.pessoafisica_id',options.pessoafisica_id)
      }


      if (options.ano) {
        query.whereRaw('YEAR(s.dia_selecionado) = ?', [options.ano]);
      }if (options.mes) {
        query.whereRaw('MONTH(s.dia_selecionado) = ?', [options.mes]);
      }

      query.where('s.situacao','aprovado')
      // Adiciona a condição de ordenação
      query.orderBy('s.dia_selecionado', 'asc'); // Ordena de forma crescente

      return query

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

converterDataParaISO(data:any)
{
  return DateTime.fromISO(data).toUTC();
}

}
