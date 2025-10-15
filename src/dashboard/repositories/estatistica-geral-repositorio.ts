import Database from "@ioc:Adonis/Lucid/Database";

export default class EstatisticaGeralRepository {

  public async listarTodosMapaEfetividadeMensal(options: any = { page: null, perPage: null,mes:null,orgao:null,habilitacaoliteraria:null,patente:null}): Promise<any> {

    try {

      let queryEfectivos = Database.from('sigpq_funcionarios')
          .select('sigpq_funcionarios.id','patentes.nome as patente','pessoas.nome_completo','pessoafisicas.genero','sigpq_funcionarios.nip',
          Database.raw("DATE_FORMAT(pessoafisicas.data_nascimento, '%d/%m/%Y') as data_nascimento"),
          Database.raw("DATE_FORMAT(sigpq_funcionarios.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw("DATE_FORMAT(sigpq_provimentos.data_provimento, '%d/%m/%Y') as data_provimento"),'sigpq_funcionarios.numero_agente'
          ,'pessoafisicas.iban','sigpq_funcionarios.pseudonimo',
          'sigpq_tipo_habilitacaoliterarias.nome as habilitacao_literaria',
          'sigpq_tipo_funcaos.nome as funcao','pessoajuridicas.sigla as orgao')
        .innerJoin('pessoas', 'pessoas.id', 'sigpq_funcionarios.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'sigpq_funcionarios.id')

        ///parte dos orgãos
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'pessoafisicas.id')
        .innerJoin('pessoajuridicas', 'pessoajuridicas.id', 'sigpq_funcionario_orgaos.pessoajuridica_id')
        .where('pessoajuridicas.orgao_comando_provincial','Orgão')
        ///FIM PARTE ORGÃO
        .where('pessoafisicas.estado','Activo')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')

        .leftJoin('sigpq_habilitacaoliterarias','sigpq_habilitacaoliterarias.pessoafisica_id','pessoafisicas.id')
         .leftJoin('sigpq_tipo_habilitacaoliterarias','sigpq_tipo_habilitacaoliterarias.id'
         ,'sigpq_habilitacaoliterarias.sigpq_tipo_habilitacaoliteraria_id')

         .leftJoin('sigpq_funcaos','sigpq_funcaos.pessoafisica_id','pessoafisicas.id')
         .leftJoin('sigpq_tipo_funcaos','sigpq_tipo_funcaos.id'
         ,'sigpq_funcaos.sigpq_tipo_funcao_id')

        .where('sigpq_funcionarios.sigpq_tipo_vinculo_id', 1) // efectivo
        .where('sigpq_provimentos.activo', true)
        .where('pessoas.eliminado', false)

        .orderBy('patentes.id','asc')

        if(options.orgao!=='null' && options.orgao!=='undefined')
        {
          queryEfectivos=queryEfectivos.where('pessoajuridicas.id',options.orgao)
        }

        if(options.funcao!=='null' && options.funcao!=='undefined')
        {
          queryEfectivos=queryEfectivos.where('sigpq_funcaos.sigpq_tipo_funcao_id',options.funcao)

        }

        if(options.patente!=='null' && options.patente!=='undefined')
        {
          queryEfectivos=queryEfectivos.where('patentes.id',options.patente)

        }

        if(options.habilitacaoliteraria!=='null')
        {
          queryEfectivos=queryEfectivos.where('sigpq_tipo_habilitacaoliterarias.id',options.habilitacaoliteraria)

        }


    const result= options.page
        ? await queryEfectivos.paginate(options.page, options.perPage || 20)
        : await queryEfectivos

      return [
        {
          id: 1,
          nome: 'Total de Efectivos no mapa de efetividade referente ao mês de Agosto',
          icone: 11,
          descricao: 111,
          dados: result
        }
      ]

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar o mapa de efetividade.');
    }

  }

  public async listarTodosMapaPassividadeMensal(options: any = { page: null, perPage: null,mes:null}): Promise<any> {

    try {

      let queryEfectivos = Database.from('sigpq_funcionarios')
          .select('sigpq_funcionarios.id','sigpq_funcionarios.nip',
          Database.raw("DATE_FORMAT(sigpq_funcionarios.data_adesao, '%d/%m/%Y') as data_adesao"),'sigpq_funcionarios.numero_agente'
          ,'sigpq_funcionarios.pseudonimo')
        .innerJoin('pessoas', 'pessoas.id', 'sigpq_funcionarios.id') //habilitação literaria --// função
        .select('pessoas.nome_completo')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'sigpq_funcionarios.id') //passivo pessoasfisicas , ativo
        .select('pessoafisicas.genero',Database.raw("DATE_FORMAT(pessoafisicas.data_nascimento, '%d/%m/%Y') as data_nascimento"))
        .where('pessoafisicas.estado','<>','Activo')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .select(Database.raw("DATE_FORMAT(sigpq_provimentos.data_provimento, '%d/%m/%Y') as data_provimento"))

        .leftJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .leftJoin('sigpq_habilitacaoliterarias','sigpq_habilitacaoliterarias.pessoafisica_id','pessoafisicas.id')
         .leftJoin('sigpq_tipo_habilitacaoliterarias','sigpq_tipo_habilitacaoliterarias.id'
         ,'sigpq_habilitacaoliterarias.sigpq_tipo_habilitacaoliteraria_id')

         .leftJoin('sigpq_funcaos','sigpq_funcaos.pessoafisica_id','pessoafisicas.id')
         .leftJoin('sigpq_tipo_funcaos','sigpq_tipo_funcaos.id'
         ,'sigpq_funcaos.sigpq_tipo_funcao_id')

         .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'pessoafisicas.id')
        .innerJoin('pessoajuridicas', 'pessoajuridicas.id', 'sigpq_funcionario_orgaos.pessoajuridica_id')
        ///parte dos orgãos
        .where('pessoajuridicas.orgao_comando_provincial','Orgão')

         .leftJoin('sigpq_documentos','sigpq_documentos.pessoafisica_id','pessoafisicas.id')

         .leftJoin('sigpq_tipo_documentos','sigpq_tipo_documentos.id'
         ,'sigpq_documentos.sigpq_tipo_documento_id').where('sigpq_tipo_documentos.sigla','BI')

         .select('sigpq_documentos.nid as bilhente_identidade')


        .select('patentes.nome as patente','sigpq_tipo_habilitacaoliterarias.nome as habilitacao_literaria',
        'sigpq_tipo_funcaos.nome as funcao')
        .where('sigpq_funcionarios.sigpq_tipo_vinculo_id', 1) // efectivo
        .where('sigpq_provimentos.activo', true)
        .where('pessoas.eliminado', false) ////Funcionariorgao e pessoas....

        if(options.orgao!=='null' && options.orgao!=='undefined')
        {
          queryEfectivos=queryEfectivos.where('pessoajuridicas.id',options.orgao)
        }

        if(options.funcao!=='null' && options.funcao!=='undefined')
        {
          queryEfectivos=queryEfectivos.where('sigpq_funcaos.sigpq_tipo_funcao_id',options.funcao)

        }

        if(options.patente!=='null' && options.patente!=='undefined')
        {
          queryEfectivos=queryEfectivos.where('patentes.id',options.patente)

        }

        if(options.habilitacaoliteraria!=='null' && options.patente!=='undefined')
        {
          queryEfectivos=queryEfectivos.where('sigpq_tipo_habilitacaoliterarias.id',options.habilitacaoliteraria)

        }

    const result= options.page
        ? await queryEfectivos.paginate(options.page, options.perPage || 20)
        : await queryEfectivos

      return [
        {
          id: 1,
          nome: 'Total de Efectivos no mapa de passividade referente ao mês de Agosto',
          icone: 11,
          descricao: 111,
          dados: result
        }
      ]

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar o mapa de efetividade.');
    }

  }

  private calculoDaPercentagemERetornoQuantidade(total: any, valor: any) {
    const percentagem = (parseFloat(valor) / parseFloat(total)) * 100;
    let resultado = percentagem.toFixed(3);  // Arredonda para uma casa decimal

    // Se a percentagem passar de 100, garantimos que seja no máximo 100%
    if (parseFloat(resultado) > 100) {
        resultado = "100.0";
    }

    return [
      {
        total: valor,
        percentagem: resultado + "%"  // Retorna a percentagem com o símbolo '%'
      }
    ];
}


  public async listarTodosComposicaoEtaria(): Promise<any> {

    try {

      const queryEfectivos = Database.from('sigpq_funcionarios')
        .innerJoin('pessoas', 'pessoas.id', 'sigpq_funcionarios.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'sigpq_funcionarios.id')
        .count('sigpq_funcionarios.id as total')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        //.where('sigpq_funcionarios.sigpq_tipo_vinculo_id', 1) // efectivo
        .where('sigpq_provimentos.activo', true)
        .where('pessoas.eliminado', false)

      const efectivosTotal:any = await queryEfectivos.clone().first()

        let dezoitoEvinteCinco:any = await queryEfectivos.clone()
            //.where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '>=',17)
            .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '<=',25)
            .first()



        let vinteCeizETrinta:any = await queryEfectivos.clone()
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '>=',26)
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '<=',30)
        .first()

        let trintaUmETrintaECinco:any = await queryEfectivos.clone()
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '>=',31)
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '<=',35)
        .first()

        let trintaeSeisQuarenta:any = await queryEfectivos.clone()
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '>=',36)
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '<=',40)
        .first()


        let QuarentaEumCinquenta:any = await queryEfectivos.clone()
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '>=',41)
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '<=',50)
        .first()

        let CinquentaEUmCinquentaCinco:any = await queryEfectivos.clone()
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '>=',51)
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '<=',55)
        .first()


        let CinquentaESeisSessenta:any = await queryEfectivos.clone()
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '>=',56)
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '<=',60)
        .first()

        let maisDeSessenta:any = await queryEfectivos.clone()
        .where(Database.raw("TIMESTAMPDIFF(YEAR, pessoafisicas.data_nascimento,NOW())"), '>=',61)
        .first()

        dezoitoEvinteCinco=this.calculoDaPercentagemERetornoQuantidade(efectivosTotal.total,dezoitoEvinteCinco.total)
        vinteCeizETrinta=this.calculoDaPercentagemERetornoQuantidade(efectivosTotal.total,vinteCeizETrinta.total)
        trintaUmETrintaECinco=this.calculoDaPercentagemERetornoQuantidade(efectivosTotal.total,trintaUmETrintaECinco.total)
        trintaeSeisQuarenta=this.calculoDaPercentagemERetornoQuantidade(efectivosTotal.total,trintaeSeisQuarenta.total)
        QuarentaEumCinquenta=this.calculoDaPercentagemERetornoQuantidade(efectivosTotal.total,QuarentaEumCinquenta.total)
        CinquentaEUmCinquentaCinco=this.calculoDaPercentagemERetornoQuantidade(efectivosTotal.total,CinquentaEUmCinquentaCinco.total)
        CinquentaESeisSessenta=this.calculoDaPercentagemERetornoQuantidade(efectivosTotal.total,CinquentaESeisSessenta.total)
        maisDeSessenta=this.calculoDaPercentagemERetornoQuantidade(efectivosTotal.total,maisDeSessenta.total)

      return [
        {
          id: 1,
          nome: 'Total de Efectivos no mapa de composição etária',
          icone: 11,
          descricao: 111,
          totalefetivos:efectivosTotal,
          dezoitoevintecinco:dezoitoEvinteCinco,
          vinteCeizetrinta:vinteCeizETrinta,
          trintaumetrintaecinco:trintaUmETrintaECinco,
          trintaeseisquarenta:trintaeSeisQuarenta,
          quarentaeumcinquenta:QuarentaEumCinquenta,
          cinquentaeumcinquentacinco:CinquentaEUmCinquentaCinco,
          Cinquentaeseissessenta:CinquentaESeisSessenta,
          maisdesessenta:maisDeSessenta
        }
      ]

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar o mapa de efetividade.');
    }

  }

  public async listar_Cargos_Direcao_Chefia(options: any = { page: null, perPage: null }) : Promise<any>
  {
      let queryEfectivos = Database.from('sigpq_funcionarios')
      .innerJoin('pessoas', 'pessoas.id', 'sigpq_funcionarios.id')
      .innerJoin('pessoafisicas', 'pessoafisicas.id', 'sigpq_funcionarios.id')
      .innerJoin('sigpq_cargos', 'sigpq_cargos.pessoafisica_id', 'pessoafisicas.id')
      .innerJoin('sigpq_tipo_cargos', 'sigpq_cargos.sigpq_tipo_cargo_id', 'sigpq_tipo_cargos.id')
      .where('sigpq_funcionarios.sigpq_tipo_vinculo_id', 1) // Efectivo
      .where('pessoas.eliminado', false)
      .groupBy('sigpq_tipo_cargos.nome', 'pessoafisicas.genero') // Agrupa por função e gênero
      .select('sigpq_tipo_cargos.nome as funcao', 'pessoafisicas.genero') // Seleciona função e gênero
      .count('pessoafisicas.id as quantidade'); // Conta a quantidade de pessoas para cada grupo

      // Executa a query e pega o resultado
      const resultados = await queryEfectivos;

      // Formata o resultado com base nas funções e gêneros
      let resultadoFormatado = resultados.reduce((acc, item) => {
          // Procura a função atual no acumulador
          let funcaoExistente = acc.find(f => f.funcao === item.funcao);

          // Se já existe, adiciona o gênero
          if (funcaoExistente) {
              funcaoExistente[item.genero] = item.quantidade;
          } else {
              // Se não existe, cria a função com o primeiro gênero
              acc.push({
                  funcao: item.funcao,
                  [item.genero]: item.quantidade
              });
          }

          return acc;
      }, []);

      // Se houver paginação, aplicá-la
      if (options.page) {
          const pagina = options.page;
          const porPagina = options.perPage || 20;
          const inicio = (pagina - 1) * porPagina;
          const fim = inicio + porPagina;
          const paginado = resultadoFormatado.slice(inicio, fim);

          return {
              data: paginado,
              page: pagina,
              perPage: porPagina,
              total: resultadoFormatado.length
          };
      }

      // Retorna o resultado sem paginação
      return resultadoFormatado;
  }

  public async listar_Formacao_Academica(options: any = { page: null, perPage: null}):Promise<any>
{
  const queryEfectivos = Database
  .from('sigpq_funcionarios')
  .innerJoin('pessoas', 'pessoas.id', 'sigpq_funcionarios.id')
  .innerJoin('pessoafisicas', 'pessoafisicas.id', 'sigpq_funcionarios.id')
  .innerJoin('sigpq_habilitacaoliterarias', 'sigpq_habilitacaoliterarias.pessoafisica_id', 'pessoafisicas.id')
  .innerJoin('sigpq_tipo_habilitacaoliterarias', 'sigpq_habilitacaoliterarias.sigpq_tipo_habilitacaoliteraria_id', 'sigpq_tipo_habilitacaoliterarias.id')
  .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
  .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
  .where('sigpq_funcionarios.sigpq_tipo_vinculo_id', 1) // Efectivo
  .where('pessoas.eliminado', false)
  .whereIn('sigpq_tipo_habilitacaoliterarias.id', [9, 10, 11, 12]) // IDs 9, 10, 11, 12
  .groupBy('sigpq_tipo_habilitacaoliterarias.nome', 'patentes.nome') // Agrupa por habilidade e patente
  .select('sigpq_tipo_habilitacaoliterarias.nome as habilidade', 'patentes.nome as patente')
  .orderBy('patentes.id','asc')
  .count('patentes.id as quantidade'); // Conta a quantidade de patentes para cada habilidade

const result = options.page
  ? await queryEfectivos.paginate(options.page, options.perPage || 20)
  : await queryEfectivos;

// Inicializar o objeto para organizar o retorno
const organizedResult = {};

// Iterar sobre o resultado da query e organizar os dados
result.forEach((row) => {
  const { patente, habilidade, quantidade } = row;

  // Verifica se a patente já existe no objeto organizado
  if (!organizedResult[patente]) {
    organizedResult[patente] = { patente, phd: 0, mestrado: 0, pos_graduacao: 0, licenciatura: 0 };
  }

  // Atualiza a quantidade correspondente à habilidade
  switch (habilidade.toLowerCase()) {
    case 'phd':
      organizedResult[patente].phd += quantidade;
      break;
    case 'mestrado':
      organizedResult[patente].mestrado += quantidade;
      break;
    case 'pós-graduação':
      organizedResult[patente].pos_graduacao += quantidade;
      break;
    case 'licenciatura':
      organizedResult[patente].licenciatura += quantidade;
      break;
    default:
      break;
  }
});

// Converte o objeto organizado em um array de objetos
const finalResult = Object.values(organizedResult);

return finalResult;

}


public async listarTodosDistribuicaoOrgao(options: any = { page: null, perPage: null, orgao: null }): Promise<any> {
  try {
    interface Item {
      nome: string;
      total?: number;
      informacao?: any;
    }

    let dados: Item[] = [];

    // Consultar os órgãos
    let queryOrgaos = await Database.from('pessoajuridicas')
      .innerJoin('pessoas', 'pessoas.id', 'pessoajuridicas.id')
      .select('pessoajuridicas.sigla', 'pessoas.nome_completo', 'pessoajuridicas.id');


    let totalOrgao = 0;

    for (let index = 0; index < queryOrgaos.length; index++) {
      try {
       // Query base para efetivos
        const queryEfectivos = Database.from('sigpq_funcionarios')
        .innerJoin('pessoas', 'pessoas.id', 'sigpq_funcionarios.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'sigpq_funcionarios.id')
        .where('sigpq_funcionarios.sigpq_tipo_vinculo_id', 1) // Efectivos
        .where('pessoas.eliminado', false)
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'pessoafisicas.id')


        // Consulta o total de pessoas físicas no órgão atual
        const totals = await queryEfectivos
          .where('sigpq_funcionario_orgaos.pessoajuridica_id', queryOrgaos[index].id)
          .count('sigpq_funcionario_orgaos.pessoajuridica_id as total');

        const total = totals[0]?.total || 0; // Pega o total ou define como 0

        // Adiciona o resultado no array de dados
        dados.push({
          nome: `${queryOrgaos[index].nome_completo} (${queryOrgaos[index].sigla})`,
          total: total
        });

        totalOrgao += total; // Soma ao total geral
      } catch (error) {
        console.error(`Erro ao processar órgão com ID: ${queryOrgaos[index].id}`, error);
      }
    }



    // Cálculo da percentagem e formatação dos dados
    dados.forEach(element => {
      element.informacao = this.calculoDaPercentagemERetornoQuantidade(totalOrgao, element.total || 0);
      delete element.total; // Remove o campo total, pois não é mais necessário
    });

    return [
      {
        id: 1,
        nome: 'Total de Efectivos distribuidos por Orgão',
        icone: 11,
        descricao: 111,
        total:totalOrgao,
        orgaos: dados, // Passa os dados corretamente formatados
      }
    ];

  } catch (e) {
    console.log(e);
    return Error('Não foi possível listar o mapa de efetividade.');
  }
}




}
