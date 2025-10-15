import Database, { DatabaseQueryBuilderContract } from "@ioc:Adonis/Lucid/Database"



export default class Repository {

  async execute(options: any): Promise<any> {
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
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'fc.pessoajuridica_id')
        .innerJoin('pessoas as ppf', 'ppf.id', 'f.id')
        .innerJoin('pessoas as ppj', 'ppj.id', 'fc.pessoajuridica_id')
        .innerJoin("sigpq_provimentos", "sigpq_provimentos.pessoa_id", "pf.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin('sigpq_tipo_chefia_comandos as tfc', 'tfc.id', 'fc.sigpq_tipo_chefia_comando_id')
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.eliminado", false)
        .orderBy('fc.activo', 'desc')
        // .where('f.activo', true)
        .where(query => {
          if (options.pessoa_id) {
            if(options.um){
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
        })


      return options.page ? await query.paginate(options.page, options.perPage || 10) : await query

    } catch (error) {
      console.log(error)
      return Error('Não foi possível listar item')
    }
  }
}