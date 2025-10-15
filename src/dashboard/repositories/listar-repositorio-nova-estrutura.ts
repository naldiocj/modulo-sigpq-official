import { mysql2 } from '../../../../config/database/database'

export default class ListarNovaEstruturaRepository {



  public async listarTodos(options: any): Promise<any> {
    enum SituacaoEstado {
      Efectividade = 1,
      Inactivo = 6
    }
    enum Carreira {
      Tecnico_Superior = 1,
      Tecnico = 2,
      Tecnico_Medio = 3,
      Administrativo = 4,
      Tesoureiro = 5,
      Auxiliar = 6,
      Oficial_Comissario = 7,
      Oficial_Superior = 8,
      Oficial_Subalterno = 9,
      Subchefe = 10,
      Agente = 11,
    }
    try {
      // Query base para contar funcionários
      const queryBase = mysql2
        .from('sigpq_funcionarios as f')
        .countDistinct('f.id as total') // Conta valores distintos de f.id
        .innerJoin('pessoas as p', 'p.id', 'f.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'f.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'p.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'p.id')
        .innerJoin('pessoajuridicas as pj', 'pj.id', 'sigpq_funcionario_orgaos.pessoajuridica_id')
        .innerJoin('regimes', 'regimes.id', 'pessoafisicas.regime_id')
        .innerJoin('sigpq_funcionario_estados', 'sigpq_funcionario_estados.pessoafisica_id', 'f.id')
        .innerJoin('sigpq_situacao_estados', 'sigpq_situacao_estados.id', 'sigpq_funcionario_estados.sigpq_situacao_id')
        .leftJoin('sigpq_estados as situacao_estado', 'situacao_estado.id', 'sigpq_funcionario_estados.sigpq_estado_id')
        .leftJoin('sigpq_estados as es', 'es.id', 'sigpq_funcionario_estados.sigpq_estado_reforma_id')
        .where('sigpq_provimentos.activo', true)
        .where('sigpq_provimentos.eliminado', false)
        .where('sigpq_funcionario_orgaos.activo', true)
        .where('sigpq_funcionario_orgaos.eliminado', false)
        .where('sigpq_funcionario_orgaos.nivel_colocacao', 'muito-alto')
        .where('p.eliminado', false);

      // Aplica filtro de órgão, se necessário
      if (!options.user.aceder_todos_agentes) {
        if (options.user.aceder_departamento) {
          queryBase.innerJoin('sigpq_funcionario_orgaos as orgao', 'orgao.pessoafisica_id', 'p.id')
            .where('orgao.nivel_colocacao', 'alto')
            .where('orgao.pessoajuridica_id', options.orgao_detalhes.sigpq_tipo_departamento.id)

        } else if (options.user.aceder_seccao) {
          queryBase.innerJoin('sigpq_funcionario_orgaos as orgao', 'orgao.pessoafisica_id', 'p.id')
            .where('orgao.nivel_colocacao', 'medio')
            .where('orgao.pessoajuridica_id', options.orgao_detalhes.sigpq_tipo_seccao.id)

        } else if (options.user.aceder_posto_policial) {
          queryBase.innerJoin('sigpq_funcionario_orgaos as orgao', 'orgao.pessoafisica_id', 'p.id')
            .where('orgao.nivel_colocacao', 'baixo')
            .where('orgao.pessoajuridica_id', options.orgao_detalhes.sigpq_tipo_posto.id)

        } else {
          queryBase.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id);
        }
      }

      // Função para executar uma query e retornar o total
      const getTotal = async (query: any) => {
        const result = await query.clone().first();
        return result?.total || 0;
      };

      // Função para criar queries com filtros específicos
      const createQuery = (filters: any) => {
        let query = queryBase.clone();
        Object.entries(filters).forEach(([key, value]: any) => {
          if (value !== undefined) {
            if (typeof value === 'object' && value.operator && value.value !== undefined) {
              if (value.operator === '<>' && Array.isArray(value.value)) {
                query.whereNotIn(key, value.value);
              } else {
                query.where(key, value.operator, value.value);
              }
            } else {
              query.where(key, value);
            }
          }
        });
        return query;
      };

      // Executa as consultas em lotes para evitar sobrecarregar o pool de conexões
      const executeQueriesInBatches = async (queries: any[], batchSize: number) => {
        const results: any = [];
        for (let i = 0; i < queries.length; i += batchSize) {
          const batch = queries.slice(i, i + batchSize);
          const batchResults: any = await Promise.all(batch.map(q => getTotal(q)));
          results.push(...batchResults);
        }
        return results;
      };

      // Lista de consultas a serem executadas
      const queries = [
        queryBase,
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade, 'pessoafisicas.regime_id': 1 }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] }, 'pessoafisicas.regime_id': 1 }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade, 'pessoafisicas.regime_id': 2 }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] }, 'pessoafisicas.regime_id': 2 }),
        createQuery({ 'pessoafisicas.regime_id': 1 }),
        createQuery({ 'pessoafisicas.regime_id': 2 }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Comissario, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Comissario, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Superior, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Superior, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Subalterno, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Subalterno, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Subchefe, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Subchefe, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Agente, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Agente, 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'pessoafisicas.genero': 'M', 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'pessoafisicas.genero': 'F', 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'pessoafisicas.genero': 'M', 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'pessoafisicas.genero': 'F', 'pessoafisicas.regime_id': 1, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'pessoafisicas.genero': 'M', 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'pessoafisicas.genero': 'F', 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'pessoafisicas.genero': 'M', 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'pessoafisicas.genero': 'F', 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico_Superior, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico_Superior, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico_Medio, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico_Medio, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Administrativo, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Administrativo, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Tesoureiro, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Tesoureiro, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Auxiliar, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Efectividade }),
        createQuery({ 'patentes.sigpq_tipo_carreira_id': Carreira.Auxiliar, 'pessoafisicas.regime_id': 2, 'sigpq_funcionario_estados.sigpq_situacao_id': { operator: '<>', value: [SituacaoEstado.Efectividade, SituacaoEstado.Inactivo] } }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 1 }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2 }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 1, 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Comissario }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 1, 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Superior }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 1, 'patentes.sigpq_tipo_carreira_id': Carreira.Oficial_Subalterno }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 1, 'patentes.sigpq_tipo_carreira_id': Carreira.Subchefe }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 1, 'patentes.sigpq_tipo_carreira_id': Carreira.Agente }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 1, 'pessoafisicas.genero': 'M' }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 1, 'pessoafisicas.genero': 'F' }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2, 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico_Superior }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2, 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2, 'patentes.sigpq_tipo_carreira_id': Carreira.Tecnico_Medio }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2, 'patentes.sigpq_tipo_carreira_id': Carreira.Administrativo }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2, 'patentes.sigpq_tipo_carreira_id': Carreira.Tesoureiro }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2, 'patentes.sigpq_tipo_carreira_id': Carreira.Auxiliar }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2, 'pessoafisicas.genero': 'M' }),
        createQuery({ 'sigpq_funcionario_estados.sigpq_situacao_id': SituacaoEstado.Inactivo, 'pessoafisicas.regime_id': 2, 'pessoafisicas.genero': 'F' }),
      ];

      // Executa as consultas em lotes de 10
      const results = await executeQueriesInBatches(queries, 10);

      // Extrai os resultados
      const [
        efectivosTotal,
        forcaActivaEspecial,
        forcaPassivaEspecial,
        forcaActivaGeral,
        forcaPassivaGeral,
        regimeEspecial,
        regimeGeral,
        oficialComissarioAtivo,
        oficialComissarioPassivo,
        oficialSuperiorAtivo,
        oficialSuperiorPassivo,
        subAlternoAtivo,
        subAlternoPassivo,
        subChefeAtivo,
        subChefePassivo,
        agenteAtivo,
        agentePassivo,
        masculinoEspecialAtivo,
        femininoEspecialAtivo,
        masculinoEspecialPassivo,
        femininoEspecialPassivo,
        masculinoGeralAtivo,
        femininoGeralAtivo,
        masculinoGeralPassivo,
        femininoGeralPassivo,
        tecnicaSuperiorAtivo,
        tecnicaSuperiorPassivo,
        tecnicaAtivo,
        tecnicaPassivo,
        tecnicaMediaAtivo,
        tecnicaMediaPassivo,
        AdministrativoAtivo,
        AdministrativoPassivo,
        motoristaPesadosAtivo,
        motoristaPesadosPassivo,
        motoristaLigeirosAtivo,
        motoristaLigeirosPassivo,
        inativosTotal,
        inativosEspecialTotal,
        inativosGeralTotal,
        inativosOficialComissarioEspecial,
        inativosOficialSuperiorEspecial,
        inativosSubAlternoEspecial,
        inativosSubChefeEspecial,
        inativosAgenteEspecial,
        inativosMasculinoEspecial,
        inativosFemininoEspecial,
        inativosTecnicoSuperiorGeral,
        inativosTecnicoGeral,
        inativosTecnicoMedioGeral,
        inativosAdministrativoGeral,
        inativosMotoristaPesadosGeral,
        inativosMotoristaLigeirosGeral,
        inativosMasculinoGeral,
        inativosFemininoGeral,
      ] = results;

      // Retorna os resultados organizados
      return {
        especial: [
          { id: 2, nome: 'Regime Especial', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: regimeEspecial, url: { id: 'regimeId', valor: 1 } },
          { id: 10, nome: 'Masculino (Activo)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculinoEspecialAtivo, url: { id: 'genero', valor: 'M' } },
          { id: 11, nome: 'Femenino (Activo)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: femininoEspecialAtivo, url: { id: 'genero', valor: 'F' } },
          { id: 10, nome: 'Masculino (Passivo)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculinoEspecialPassivo, url: { id: 'genero', valor: 'M' } },
          { id: 11, nome: 'Femenino (Passivo)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: femininoEspecialPassivo, url: { id: 'genero', valor: 'F' } },
          { id: 12, nome: 'Força Activa (Especial)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaActivaEspecial, url: { id: 'patenteClasse', valor: 1 } },
          { id: 12, nome: 'Força Passiva (Especial)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaPassivaEspecial, url: { id: 'patenteClasse', valor: 1 } },
          { id: 12, nome: 'Força Inactiva', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosEspecialTotal, url: { id: 'forcaInactiva', valor: 1 } },
        ],
        geral: [
          { id: 3, nome: 'Regime Geral', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: regimeGeral, url: { id: 'regimeId', valor: 2 } },
          { id: 10, nome: 'Masculino (Ativo)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculinoGeralAtivo, url: { id: 'genero', valor: 'M' } },
          { id: 11, nome: 'Feminino (Ativo)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: femininoGeralAtivo, url: { id: 'genero', valor: 'F' } },
          { id: 10, nome: 'Masculino (Passivo)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculinoGeralPassivo, url: { id: 'genero', valor: 'M' } },
          { id: 11, nome: 'Feminino (Passivo)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: femininoGeralPassivo, url: { id: 'genero', valor: 'F' } },
          { id: 12, nome: 'Força Activa (Geral)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaActivaGeral, url: { id: 'patenteClasse', valor: 1 } },
          { id: 12, nome: 'Força Passiva (Geral)', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaPassivaGeral, url: { id: 'patenteClasse', valor: 1 } },
          { id: 12, nome: 'Força Inactiva', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosGeralTotal, url: { id: 'forcaInactiva', valor: 1 } },
        ],
        geral_efectivo_passivo: [
          { id: 12, nome: 'Total de Efectivo Geral Passivo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaPassivaGeral, url: { id: 'patenteClasse', valor: 1 } },
          { id: 12, nome: 'Técnico Superior', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: tecnicaSuperiorPassivo, url: { id: 'patenteClasse', valor: Carreira.Tecnico_Superior } },
          { id: 12, nome: 'Técnico', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: tecnicaPassivo, url: { id: 'patenteClasse', valor: Carreira.Tecnico } },
          { id: 12, nome: 'Técnico Médio', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: tecnicaMediaPassivo, url: { id: 'patenteClasse', valor: Carreira.Tecnico_Medio } },
          { id: 12, nome: 'Administrativo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: AdministrativoPassivo, url: { id: 'patenteClasse', valor: Carreira.Administrativo } },
          { id: 12, nome: 'Tesoureiro', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: motoristaPesadosPassivo, url: { id: 'patenteClasse', valor: Carreira.Tesoureiro } },
          { id: 12, nome: 'Auxiliar', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: motoristaLigeirosPassivo, url: { id: 'patenteClasse', valor: Carreira.Auxiliar } },
          { id: 10, nome: 'Masculino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculinoGeralPassivo, url: { id: 'genero', valor: 'M' } },
          { id: 11, nome: 'Feminino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: femininoGeralPassivo, url: { id: 'genero', valor: 'F' } },
        ],
        geral_efectivo_ativo: [
          { id: 12, nome: 'Total de Efectivo Geral Activo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaActivaGeral, url: { id: 'patenteClasse', valor: 1 } },
          { id: 12, nome: 'Técnico Superior', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: tecnicaSuperiorAtivo, url: { id: 'patenteClasse', valor: Carreira.Tecnico_Superior } },
          { id: 12, nome: 'Técnico', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: tecnicaAtivo, url: { id: 'patenteClasse', valor: Carreira.Tecnico } },
          { id: 12, nome: 'Técnico Médio', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: tecnicaMediaAtivo, url: { id: 'patenteClasse', valor: Carreira.Tecnico_Medio } },
          { id: 12, nome: 'Administrativo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: AdministrativoAtivo, url: { id: 'patenteClasse', valor: Carreira.Administrativo } },
          { id: 12, nome: 'Tesoureiro', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: motoristaPesadosAtivo, url: { id: 'patenteClasse', valor: Carreira.Tesoureiro } },
          { id: 12, nome: 'Auxiliar', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: motoristaLigeirosAtivo, url: { id: 'patenteClasse', valor: Carreira.Auxiliar } },
          { id: 10, nome: 'Masculino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculinoGeralAtivo, url: { id: 'genero', valor: 'M' } },
          { id: 11, nome: 'Feminino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: femininoGeralAtivo, url: { id: 'genero', valor: 'F' } },
        ],
        geral_efectivo_inactivo: [
          { id: 1, nome: 'Total de Efectivo Geral Inactivo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosGeralTotal, url: { id: 'tipoVinculoId', valor: 1 } },
          { id: 4, nome: 'Técnico Superior', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosTecnicoSuperiorGeral, url: { id: 'patenteClasse', valor: Carreira.Tecnico_Superior } },
          { id: 5, nome: 'Técnico', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosTecnicoGeral, url: { id: 'patenteClasse', valor: Carreira.Tecnico } },
          { id: 6, nome: 'Técnico Médio', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosTecnicoMedioGeral, url: { id: 'patenteClasse', valor: Carreira.Tecnico_Medio } },
          { id: 7, nome: 'Administrativo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosAdministrativoGeral, url: { id: 'patenteClasse', valor: Carreira.Administrativo } },
          { id: 8, nome: 'Tesoureiro', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosMotoristaPesadosGeral, url: { id: 'patenteClasse', valor: Carreira.Tesoureiro } },
          { id: 9, nome: 'Auxiliar', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosMotoristaLigeirosGeral, url: { id: 'patenteClasse', valor: Carreira.Auxiliar } },
          { id: 14, nome: 'Masculino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosMasculinoGeral, url: { id: 'genero', valor: 'M' } },
          { id: 15, nome: 'Feminino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosFemininoGeral, url: { id: 'genero', valor: 'F' } },
        ],
        especial_efectivos_ativos: [
          { id: 1, nome: 'Total de Efectivo Especial Activo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaActivaEspecial, url: { id: 'tipoVinculoId', valor: 1 } },
          { id: 4, nome: 'Oficial Comissário', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: oficialComissarioAtivo, url: { id: 'patenteClasse', valor: Carreira.Oficial_Comissario } },
          { id: 5, nome: 'Oficial Superior', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: oficialSuperiorAtivo, url: { id: 'patenteClasse', valor: Carreira.Oficial_Superior } },
          { id: 6, nome: 'Oficial Subalterno', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: subAlternoAtivo, url: { id: 'patenteClasse', valor: Carreira.Oficial_Subalterno } },
          { id: 7, nome: 'Subchefe', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: subChefeAtivo, url: { id: 'patenteClasse', valor: Carreira.Subchefe } },
          { id: 8, nome: 'Agente', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: agenteAtivo, url: { id: 'patenteClasse', valor: Carreira.Agente } },
          { id: 9, nome: 'Femenino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: femininoEspecialAtivo, url: { id: 'genero', valor: 'F' } },
          { id: 10, nome: 'Masculino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculinoEspecialAtivo, url: { id: 'genero', valor: 'M' } },
        ],
        especial_efectivos_passivo: [
          { id: 1, nome: 'Total de Efectivo Especial Passivo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaPassivaEspecial, url: { id: 'tipoVinculoId', valor: 1 } },
          { id: 4, nome: 'Oficial Comissário', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: oficialComissarioPassivo, url: { id: 'patenteClasse', valor: Carreira.Oficial_Comissario } },
          { id: 5, nome: 'Oficial Superior', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: oficialSuperiorPassivo, url: { id: 'patenteClasse', valor: Carreira.Oficial_Superior } },
          { id: 6, nome: 'Oficial Subalterno', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: subAlternoPassivo, url: { id: 'patenteClasse', valor: Carreira.Oficial_Subalterno } },
          { id: 7, nome: 'Subchefe', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: subChefePassivo, url: { id: 'patenteClasse', valor: Carreira.Subchefe } },
          { id: 8, nome: 'Agente', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: agentePassivo, url: { id: 'patenteClasse', valor: Carreira.Agente } },
          { id: 9, nome: 'Femenino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: femininoEspecialPassivo, url: { id: 'genero', valor: 'F' } },
          { id: 10, nome: 'Masculino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculinoEspecialPassivo, url: { id: 'genero', valor: 'M' } },
        ],
        especial_efectivo_inactivo: [
          { id: 1, nome: 'Total de Efectivo Especial Inactivo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosEspecialTotal, url: { id: 'tipoVinculoId', valor: 1 } },
          { id: 4, nome: 'Oficial Comissário', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosOficialComissarioEspecial, url: { id: 'patenteClasse', valor: Carreira.Oficial_Comissario } },
          { id: 5, nome: 'Oficial Superior', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosOficialSuperiorEspecial, url: { id: 'patenteClasse', valor: Carreira.Oficial_Superior } },
          { id: 6, nome: 'Oficial Subalterno', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosSubAlternoEspecial, url: { id: 'patenteClasse', valor: Carreira.Oficial_Subalterno } },
          { id: 7, nome: 'Subchefe', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosSubChefeEspecial, url: { id: 'patenteClasse', valor: Carreira.Subchefe } },
          { id: 8, nome: 'Agente', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosAgenteEspecial, url: { id: 'patenteClasse', valor: Carreira.Agente } },
          { id: 9, nome: 'Masculino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosMasculinoEspecial, url: { id: 'genero', valor: 'M' } },
          { id: 10, nome: 'Femenino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: inativosFemininoEspecial, url: { id: 'genero', valor: 'F' } },
        ],

        resumo: [
          { id: 1, nome: 'Total de Efectivo', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: efectivosTotal, url: { id: 'tipoVinculoId', valor: 1 } },
          { id: 2, nome: 'Regime Especial', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: regimeEspecial, url: { id: 'regimeId', valor: 1 } },
          { id: 3, nome: 'Regime Geral', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: regimeGeral, url: { id: 'regimeId', valor: 2 } },
        ],
      };
    } catch (e) {
      console.log(e);
      throw new Error('Não foi possível listar os dashboards.');
    }
  }

}
