import Database, { DatabaseQueryBuilderContract } from "@ioc:Adonis/Lucid/Database"
import { funcaoCompoatilhada_isValidString } from "../../../@core/helpers/funcoesCompartilhadas"



export default class Repository {

  async execute(options: any): Promise<any> {
    const trx = await Database.transaction();
    try {
      const query: DatabaseQueryBuilderContract = Database.from({ fc: 'sigpq_funcionario_chefias' })
        .select(
          'fc.id',
          'fc.pessoafisica_id',
          'fc.pessoajuridica_id',
          'fc.activo',
          // Database.raw("concat(ppf.nome_completo, ' ',pf.apelido) as nome_completo"),
          Database.raw("upper(ppf.nome_completo) as nome_completo"),
          // "pf.activo",
          "pj.sigla",
          'ppj.nome_completo as orgao ',

          Database.raw("upper(pf.apelido) as apelido"),
          "pf.genero",
          "pf.estado",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          'tfc.nome as chefia',
          "patentes.nome as patente_nome",
          "f.id as funcionario_id",
          Database.raw("DATE_FORMAT(f.created_at, '%d/%m/%Y %H:%i:%s') as created_at"),
          Database.raw("DATE_FORMAT(f.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at")
        )
        // .where('ppf.eliminado', false)
        .innerJoin('sigpq_funcionarios as f', 'f.id', 'fc.pessoafisica_id')
        .innerJoin('pessoafisicas as pf', 'pf.id', 'f.id')
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'pf.id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'sigpq_funcionario_orgaos.pessoajuridica_id')
        //.innerJoin('pessoajuridicas as pj', 'pj.id', 'fc.pessoajuridica_id')
        .innerJoin('pessoas as ppf', 'ppf.id', 'f.id')
        .innerJoin('pessoas as ppj', 'ppj.id', 'fc.pessoajuridica_id')
        .where('sigpq_funcionario_orgaos.activo', true)
        .where('sigpq_funcionario_orgaos.eliminado', false)
        .where('sigpq_funcionario_orgaos.nivel_colocacao', 'muito-alto')
        .innerJoin("sigpq_provimentos", "sigpq_provimentos.pessoa_id", "pf.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin('sigpq_tipo_chefia_comandos as tfc', 'tfc.id', 'fc.sigpq_tipo_chefia_comando_id')
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.eliminado", false)
        .where("fc.eliminado", false)
        // .where('f.activo', true)
        .where(query => {
          if (options.pessoa_id) {
            if(options.um){
              console.log("Dados ddddaqui!!!!")
              query.where('fc.activo', true)
            }
            query.where('fc.pessoafisica_id', options.pessoa_id)
          } else {
            query.where('fc.activo', true)
          }
        })
        .where(query => {
          if (options.pessoajuridica_id) {
            if(options.um){
              query.where('fc.activo', true)
            }
            query.where('fc.pessoajuridica_id', options.pessoajuridica_id)
          }else{
            query.where('fc.activo', true)
          }
        })
        .where((query: any) => {
          if (options.search) {
            query.where('p.nome_completo', 'like', `%${options.search}%`)
            query.orWhere('ppj.nome_completo', 'like', `%${options.search}%`)
            query.orWhere('tfc.nome', 'like', `%${options.search}%`)
          }

          if (options.regimeId) {
            query.where('pf.regime_id', Number(options.regimeId));
          }

          if (options.tipoVinculoId) {
            //query.where('f.sigpq_tipo_vinculo_id', Number(options.tipoVinculoId));
          }

          if (options.patenteClasse) {
            query.where('patentes.sigpq_tipo_carreira_id', options.patenteClasse);
          }

          if (options.patenteId) {
            query.where('patentes.id', Number(options.patenteId));
          }

          if (options.genero) {
            query.where('pf.genero', options.genero);
          }

          if (options.orgaoId) {
           
            query.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgaoId);
          }
          if (options.tipoOrgaoId) {
            query.where('pj.tipo_estrutura_organica_sigla', options.tipoOrgaoId);
          }

          if (options.funcao_id) {
            query
              .where('fc.sigpq_tipo_chefia_comando_id', options.funcao_id)
          }
        })

        if (!options.orderby) {}//query.orderBy('p.updated_at', 'desc')
        else if (options.orderby == 'PATENTE') query.orderBy('patentes.id', 'asc')
        else if (options.orderby == 'NIP') query.orderBy('f.nip', 'asc')
        else if (options.orderby == 'NOME') query.orderBy('nome_completo', 'asc')

       
        if (options.page) {

         
          const pagination: any = await query.paginate(options.page, options.perPage || 10);
          pagination.rows = await this.enriquecerDados(pagination.rows, trx);
          await trx.commit();
          return pagination;
        } else {
          const items = await query;
          const enrichedItems = await this.enriquecerDados(items, trx);
          await trx.commit();
          return enrichedItems;
        }


    } catch (error) {
      console.log(error)
      await trx.rollback();
      return Error('Não foi possível listar item')
    }
  }

  private async enriquecerDados(items: any[], trx: any = null) {
    
    return Promise.all(items.map(async (item) => {
      const orgao = await this.acharOrgao_do_agente(item?.pessoafisica_id, trx);

      return {
        ...item,
        orgao_detalhe: item?.id ? orgao : null,
      };
    }));
  }

  public async acharOrgao_do_agente(agente_id: string, trx: any = null): Promise<any> {
    if (!funcaoCompoatilhada_isValidString(agente_id)) return null;
    return await Database.from({ orgao_table: 'sigpq_funcionario_orgaos' })
      .useTransaction(trx)
      .select(
        'p_aux.id',
        Database.raw("upper(p_aux.nome_completo) as nome"),
        Database.raw("upper(pd_aux.nome_completo) as nome_passado"),
        'p_aux.user_id',
        'p_aux.activo',
        'pj_aux.sigla',
        'pdf_aux.sigla as sigla_passado',
        'pdf_aux.descricao',
        Database.raw("DATE_FORMAT(p_aux.created_at, '%d/%m/%Y %H:%i:%s') as createdAt"),
        Database.raw("DATE_FORMAT(p_aux.updated_at, '%d/%m/%Y %H:%i:%s') as updatedAt")
      )
      .innerJoin('sigpq_funcionario_orgaos as orgao', 'orgao_table.pessoafisica_id', agente_id)
      .innerJoin('pessoajuridicas as pj_aux', 'pj_aux.id', 'orgao_table.pessoajuridica_id')
      .innerJoin('pessoas as p_aux', 'p_aux.id', 'pj_aux.id')
      .leftJoin('pessoas as pd_aux', 'pd_aux.id', 'orgao_table.pessoajuridica_passado_id')
      .leftJoin('pessoajuridicas as pdf_aux', 'pdf_aux.id', 'pd_aux.id')
      .where('p_aux.eliminado', false)
      .where('pj_aux.tipo_pessoajuridica_id', 1)
      .where('orgao_table.pessoafisica_id', agente_id)
      .where('orgao_table.eliminado', false)
      .where('orgao_table.activo', true)
      .first()
  }
}