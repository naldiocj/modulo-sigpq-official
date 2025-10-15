import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import BaseModuloRepository from 'App/Repositories/modulo/BaseModuloRepository';

export default class CrudBaseRepository {
  #baseRepo
  constructor() {
    this.#baseRepo = new BaseModuloRepository('tipo_pessoajuridicas')
  }

  public async registar(input: any): Promise<any> {

    if (!input.nome) {
      return Error('O campo Nome é obrigatório.')
    }

    if (!input.sigla) {
      return Error('O campo Sigla é obrigatório.')
    }

    if (!input.user_id) {
      return Error('Utilizador não está logado')
    }

    try {

      return await this.#baseRepo.registar(input)

    } catch (e) {
      console.log(e);
      throw new Error('Não foi possível criar um novo registo.');
    }

  }



  public async listarTodos(options: any): Promise<any> {

    try {

      return await this.#baseRepo.listarTodos(options)

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async findById(id: any): Promise<any> {

    try {

      return await this.#baseRepo.findById(id)

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os registos.');
    }

  }

  public async _saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo(options: any): Promise<any> //Método genérico e anterior
  {
    try {

      if (!options.pessoajuridica_id) return 'Porfavor envie o query parametro do pessoajuridica_id campo pessoa Juridica';

      let query = Database.from({ cargo: 'sigpq_cargos' })
        .select(Database.raw("upper(pessoa.nome_completo) as nome_completo  "), Database.raw("upper(pessoafisicas.apelido) as apelido"),
          Database.raw("upper(patentes.nome) as patente_nome"), Database.raw("upper(sigpq_tipo_cargos.nome) as cargo_nome"))

        .innerJoin('sigpq_tipo_cargos', 'sigpq_tipo_cargos.id', 'cargo.sigpq_tipo_cargo_id')
        .where('cargo.eliminado', false)
        .where('cargo.pessoajuridica_id', options.pessoajuridica_id)
        .where('cargo.situacao', 'actual')
        .where(function (builder) {
          ///COM BASE A HIERARQUIA DA POLICIA NACIONAL
          //builder.where('sigpq_tipo_cargos.nome', 'INSPECTOR GERAL PNA')
          builder.where('sigpq_tipo_cargos.nome', 'DIRECTOR NACIONAL')
            //.orWhere(Database.raw("UPPER(sigpq_tipo_cargos.nome) = ?", ['DIRECTOR ADJUNTO']))
            .orWhere(Database.raw("UPPER(sigpq_tipo_cargos.nome) = ?", ['COMANDANTE DA UNIDADE']))
            .orWhere(Database.raw("UPPER(sigpq_tipo_cargos.nome) = ?", ['COMANDANTE PROVINCIAL']))
          //.orWhere(Database.raw("UPPER(sigpq_tipo_cargos.nome) = ?", ['CHEFE DE DEPARTAMENTO']))
          /* .orWhere(Database.raw("UPPER(sigpq_tipo_cargos.nome) = ?", ['COMANDANTE MUNICIPAL']))
          .orWhere(Database.raw("UPPER(sigpq_tipo_cargos.nome) = ?", ['CHEFE DE SECÇÃO']))
          .orWhere(Database.raw("UPPER(sigpq_tipo_cargos.nome) = ?", ['COMANDANTE DA ESQUADRA'])); */


        }).innerJoin('pessoafisicas', 'pessoafisicas.id', 'cargo.pessoafisica_id')
        .innerJoin('pessoajuridicas', 'pessoajuridicas.id', 'cargo.pessoajuridica_id')
        .innerJoin('pessoas as pessoa', 'pessoa.id', 'pessoafisicas.id')
        //.innerJoin('pessoas as pessoaJuridica', 'pessoaJuridica.id', 'pessoajuridicas.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoa.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .where('sigpq_provimentos.activo', true)
        .first()
      return query

    } catch (error) {
      console.log(error);
      return Error('Não foi possível listar saber a Entidade Máxima onde pertence este efectivo.');
    }
  }

  public async saberEntidadeMaximaDoOrgaoPorMeioDeUmEfectivo(options: any): Promise<any> //Método genérico e anterior
  {
    try {

      if (!options.pessoajuridica_id) return 'Porfavor envie o query parametro do pessoajuridica_id campo pessoa Juridica';

      //let pessoajuridica = await Database.from({ pessoajuridica: 'pessoajuridicas' }).where('pessoajuridica.id', options.pessoajuridica_id).select('pessoajuridica.*').first();
      let query = Database.from({ cargo: 'sigpq_funcionario_chefias' })
        .select(Database.raw("UPPER(CONCAT(pessoa.nome_completo, ' ', COALESCE(pessoafisicas.apelido, ''))) as nome_completo")
          , Database.raw("upper(pessoafisicas.apelido) as apelido"),
          Database.raw("upper(patentes.nome) as patente_nome"), Database.raw("upper(sigpq_tipo_chefia_comandos.nome) as cargo_nome"))

        .innerJoin('pessoajuridicas', 'pessoajuridicas.id', 'cargo.pessoajuridica_id')
        .innerJoin('sigpq_tipo_chefia_comandos', 'sigpq_tipo_chefia_comandos.id', 'cargo.sigpq_tipo_chefia_comando_id')
        .where('cargo.eliminado', false)
        .where('cargo.pessoajuridica_id', options.pessoajuridica_id)
        .whereILike('sigpq_tipo_chefia_comandos.nome', 'director nacional')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'cargo.pessoafisica_id')
        .innerJoin('pessoas as pessoa', 'pessoa.id', 'pessoafisicas.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoa.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .where('sigpq_provimentos.activo', true)
        /* .where(function (builder) {
          ///COM BASE A HIERARQUIA DA POLICIA NACIONAL
          if (pessoajuridica?.orgao_comando_provincial.toUpperCase().trim() == "Órgao".toUpperCase().trim()) {
            
            builder.where('sigpq_tipo_chefia_comandos.nome', 'DIRECTOR NACIONAL')
            .orWhere(Database.raw("UPPER(sigpq_tipo_chefia_comandos.nome) = ?", ['COMANDANTE DA UNIDADE']))
              
          } else if (pessoajuridica?.orgao_comando_provincial.toUpperCase().trim() == "Comando Provincial".toUpperCase().trim()) {
            builder.where('sigpq_tipo_chefia_comandos.nome', 'COMANDANTE PROVINCIAL')
          } else if (pessoajuridica?.orgao_comando_provincial.toUpperCase().trim() == "Departamento".toUpperCase().trim()) {
            builder.where('sigpq_tipo_chefia_comandos.nome', 'CHEFE DE DEPARTAMENTO')
          }
          else if (pessoajuridica?.orgao_comando_provincial.toUpperCase().trim() == "Comando Municipal".toUpperCase().trim()) {
            builder.where('sigpq_tipo_chefia_comandos.nome', 'COMANDANTE MUNICIPAL')
          }

          else if (pessoajuridica?.orgao_comando_provincial.toUpperCase().trim() == "Secção".toUpperCase().trim()) {
            builder.where('sigpq_tipo_chefia_comandos.nome', 'CHEFE DE SECÇÃO')
          }

          else if (pessoajuridica?.orgao_comando_provincial.toUpperCase().trim() == "Esquadra".toUpperCase().trim()) {
            builder.where('sigpq_tipo_chefia_comandos.nome', 'COMANDANTE DA ESQUADRA')
          }

        }) */
      
      const result = (await query).map(row => ({ ...row }))
      return result[0]

    } catch (error) {
      console.log(error);
      return Error('Não foi possível listar saber a Entidade Máxima onde pertence este efectivo.');
    }
  }

}
