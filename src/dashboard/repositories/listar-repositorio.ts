import { mysql2 } from './../../../../config/database/database'

export default class ListarRepository {

  public async listarTodos(options: any): Promise<any> {

    // Agente só pode ter uma patente activa
    // Agente só pode ter um orgao activo
    try {

      const queryEfectivos = mysql2.from('sigpq_funcionarios')
        .count('sigpq_funcionarios.id as total')
        .distinct()
        .innerJoin('pessoas', 'pessoas.id', 'sigpq_funcionarios.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'sigpq_funcionarios.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'pessoas.id')
        .innerJoin('sigpq_funcionario_estados', 'sigpq_funcionario_estados.pessoafisica_id', 'sigpq_funcionarios.id')
        .innerJoin('sigpq_situacao_estados', 'sigpq_situacao_estados.id', 'sigpq_funcionario_estados.sigpq_situacao_id')
        // .leftJoin('sigpq_estados as es', 'es.id', 'fe.sigpq_estado_id')
        // .where('sigpq_funcionarios.sigpq_tipo_vinculo_id', 1) // efectivo
        .where('pessoas.eliminado', false)
        .where('sigpq_funcionario_orgaos.nivel_colocacao', 'muito-alto')
        // .where('pessoafisicas.estado', 'activo')
        .where('sigpq_provimentos.activo', true)
        .where('sigpq_provimentos.eliminado', false)
        .where('sigpq_funcionario_orgaos.activo', true)
        .where('sigpq_funcionario_orgaos.eliminado', false)

      if (!options.user.aceder_todos_agentes) {
        queryEfectivos.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
      }

      const efectivosTotal = await queryEfectivos.clone().first()

      const forcaActiva = await queryEfectivos.clone()
        .where('sigpq_situacao_estados.nome', 'Efectividade')
        .first()
      const forcaPassiva = await queryEfectivos.clone()
        .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
        .first()

      let regimeEspecial = await queryEfectivos.clone()
        .where('pessoafisicas.regime_id', 1) // Especial
        .first()

      let regimeGeral = await queryEfectivos.clone()
        .where('pessoafisicas.regime_id', 2) // Geral
        .first()

      // Oficial Comissário
      const oficialComissario = await queryEfectivos.clone()
        .where('patentes.classe', 'Oficial Comissário') // Geral
        .where('pessoafisicas.regime_id', 1)
        .first()


      // Oficial Superior
      const oficialSuperior = await queryEfectivos.clone()
        .where('patentes.classe', 'Oficial Superior') // Geral
        .where('pessoafisicas.regime_id', 1)
        .first()

      // Sub-Alterno
      const subAlterno = await queryEfectivos.clone()
        .where('patentes.classe', 'Oficial Subalterno') // Geral
        .where('pessoafisicas.regime_id', 1)
        .first()

      // Sub-chefe
      const subChefe = await queryEfectivos.clone()
        .where('patentes.classe', 'Subchefe') // Geral
        .where('pessoafisicas.regime_id', 1)
        .first()

      // Agente
      const agente = await queryEfectivos.clone()
        .where('patentes.classe', 'Agente') // Geral
        .where('pessoafisicas.regime_id', 1)
        .first()

      // Masculino
      const masculino = await queryEfectivos.clone()
        .where('pessoafisicas.genero', 'M') // Especial
        .first()

      // feminino
      const feminino = await queryEfectivos.clone()
        .where('pessoafisicas.genero', 'F') // Especial
        .first()

      return [
        {
          id: 1,
          nome: 'Total de Efectivo',
          icone: 'perfil-d bi bi-person-circle',
          descricao: 111,
          total: efectivosTotal.total || 0,
          totalPassivo: '0 Inactivo',
          url: {
            id: 'tipoVinculoId',
            valor: 1,
          }
        },
        {
          id: 2, nome: 'Regime Especial', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: regimeEspecial.total || 0,
          url: {
            id: 'regimeId',
            valor: 1,
          }
        },
        {
          id: 3, nome: 'Regime Geral', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: regimeGeral.total || 0, url: {
            id: 'regimeId',
            valor: 2
          }
        },
        {
          id: 4, nome: 'Oficial Comissário', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: oficialComissario.total || 0, url: {
            id: 'patenteClasse',
            valor: '7'
          }
        },
        {
          id: 5, nome: 'Oficial Superior', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: oficialSuperior.total | 0, url: {
            id: 'patenteClasse',
            valor: '8'
          }
        },
        {
          id: 6, nome: 'Oficial Subalterno', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: subAlterno.total || 0, url: {
            id: 'patenteClasse',
            valor: '9'
          }
        },
        {
          id: 7, nome: 'Subchefe', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: subChefe.total || 0, url: {
            id: 'patenteClasse',
            valor: '10'
          }
        },
        {
          id: 8, nome: 'Agente', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: agente.total || 0, url: {
            id: 'patenteClasse',
            valor: '11'
          }
        },
        {
          id: 10, nome: 'Masculino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: masculino.total || 0, url: {
            id: 'genero',
            valor: 'M'
          }
        },
        {
          id: 11, nome: 'Feminino', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: feminino.total || 0, url: {
            id: 'genero',
            valor: 'F'
          }
        },
        {
          id: 12, nome: 'Força Activa', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaActiva.total || 0, url: {
            id: 'forcaActiva',
            valor: 1
          }
        },
        {
          id: 12, nome: 'Força Passiva', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: forcaPassiva.total || 0, url: {
            id: 'forcaPassiva',
            valor: 1
          }
        }
        // { id: 9, nome: 'Trabalhadores Civis', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: civil || 0 },
        // { id: 3, nome: 'Total de Quadros 2', icone: 'perfil-d bi bi-person-circle', descricao: 111, total: 0 },
      ]

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os dashboards.');
    }

  }


  public async listarTodos_novaEstrutura(options: any): Promise<any> {

    // Agente só pode ter uma patente activa
    // Agente só pode ter um orgao activo
    try {

      const queryEfectivos = mysql2.from('sigpq_funcionarios')
        .count('sigpq_funcionarios.id as total')
        .distinct()
        .innerJoin('pessoas', 'pessoas.id', 'sigpq_funcionarios.id')
        .innerJoin('pessoafisicas', 'pessoafisicas.id', 'sigpq_funcionarios.id')
        .innerJoin('sigpq_provimentos', 'sigpq_provimentos.pessoa_id', 'pessoas.id')
        .innerJoin('patentes', 'patentes.id', 'sigpq_provimentos.patente_id')
        .innerJoin('sigpq_funcionario_orgaos', 'sigpq_funcionario_orgaos.pessoafisica_id', 'pessoas.id')
        .innerJoin('sigpq_funcionario_estados', 'sigpq_funcionario_estados.pessoafisica_id', 'sigpq_funcionarios.id')
        .innerJoin('sigpq_situacao_estados', 'sigpq_situacao_estados.id', 'sigpq_funcionario_estados.sigpq_situacao_id')
        // .leftJoin('sigpq_estados as es', 'es.id', 'fe.sigpq_estado_id')
        // .where('sigpq_funcionarios.sigpq_tipo_vinculo_id', 1) // efectivo
        .where('pessoas.eliminado', false)
        .where('sigpq_funcionario_orgaos.nivel_colocacao', 'muito-alto')
        // .where('pessoafisicas.estado', 'activo')
        .where('sigpq_provimentos.activo', true)
        .where('sigpq_provimentos.eliminado', false)
        .where('sigpq_funcionario_orgaos.activo', true)
        .where('sigpq_funcionario_orgaos.eliminado', false)

      if (!options.user.aceder_todos_agentes) {
        queryEfectivos.where('sigpq_funcionario_orgaos.pessoajuridica_id', options.orgao?.id)
      }

      const efectivosTotal = await queryEfectivos.clone().first()

      const forcaActivaEspecial = await queryEfectivos.clone()
        .where('sigpq_situacao_estados.nome', 'Efectividade')
        .where('pessoafisicas.regime_id', 1) // Especial
        .first()

      const forcaPassivaEspecial = await queryEfectivos.clone()
        .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
        .where('pessoafisicas.regime_id', 1) // Especial
        .first()

        const forcaActivaGeral = await queryEfectivos.clone()
        .where('sigpq_situacao_estados.nome', 'Efectividade')
        .where('pessoafisicas.regime_id', 2) // Geral
        .first()

      const forcaPassivaGeral = await queryEfectivos.clone()
        .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
        .where('pessoafisicas.regime_id', 2) // Geral
        .first()

      let regimeEspecial = await queryEfectivos.clone()
        .where('pessoafisicas.regime_id', 1) // Especial
        .first()

      let regimeGeral = await queryEfectivos.clone()
        .where('pessoafisicas.regime_id', 2) // Geral
        .first()

       // Oficial Comissário
       const oficialComissarioAtivo = await queryEfectivos.clone()
       .where('patentes.classe', 'Oficial Comissário') // Geral
       .where('pessoafisicas.regime_id', 1)
       .where('sigpq_situacao_estados.nome', 'Efectividade')
       .first()

       // Oficial Comissário
     const oficialComissarioPassivo = await queryEfectivos.clone()
     .where('patentes.classe', 'Oficial Comissário') // Geral
     .where('pessoafisicas.regime_id', 1)
     .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
     .first()

     // Oficial Superior
     const oficialSuperiorAtivo = await queryEfectivos.clone()
       .where('patentes.classe', 'Oficial Superior') // Geral
       .where('pessoafisicas.regime_id', 1)
       .where('sigpq_situacao_estados.nome', 'Efectividade')
       .first()

       // Oficial Superior
     const oficialSuperiorPassivo = await queryEfectivos.clone()
     .where('patentes.classe', 'Oficial Superior') // Geral
     .where('pessoafisicas.regime_id', 1)
     .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
     .first()

     // Sub-Alterno
     const subAlternoAtivo = await queryEfectivos.clone()
       .where('patentes.classe', 'Oficial Subalterno') // Geral
       .where('pessoafisicas.regime_id', 1)
       .where('sigpq_situacao_estados.nome','Efectividade')
       .first()

       // Sub-Alterno
     const subAlternoPassivo = await queryEfectivos.clone()
     .where('patentes.classe', 'Oficial Subalterno') // Geral
     .where('pessoafisicas.regime_id', 1)
     .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
     .first()

     // Sub-chefe
     const subChefeAtivo = await queryEfectivos.clone()
       .where('patentes.classe', 'Subchefe') // Geral
       .where('pessoafisicas.regime_id', 1)
       .where('sigpq_situacao_estados.nome', 'Efectividade')
       .first()

        // Sub-chefe
     const subChefePassivo = await queryEfectivos.clone()
     .where('patentes.classe', 'Subchefe') // Geral
     .where('pessoafisicas.regime_id', 1)
     .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
     .first()

     // Agente
     const agenteAtivo = await queryEfectivos.clone()
       .where('patentes.classe', 'Agente') // Geral
       .where('pessoafisicas.regime_id', 1)
       .where('sigpq_situacao_estados.nome', 'Efectividade')
       .first()

       // Agente
     const agentePassivo = await queryEfectivos.clone()
     .where('patentes.classe', 'Agente') // Geral
     .where('pessoafisicas.regime_id', 1)
     .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
     .first()

      // Masculino
      const masculinoEspecialPassivo = await queryEfectivos.clone()
        .where('pessoafisicas.genero', 'M') // Especial
        .where('pessoafisicas.regime_id', 1)
        .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
        .first()

      // feminino
      const femininoEspecialPassivo = await queryEfectivos.clone()
        .where('pessoafisicas.genero', 'F') // Especial
        .where('pessoafisicas.regime_id', 1)
        .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
        .first()

        // Masculino
      const masculinoEspecialAtivo = await queryEfectivos.clone()
      .where('pessoafisicas.genero', 'M') // Especial
      .where('pessoafisicas.regime_id', 1)
      .where('sigpq_situacao_estados.nome', 'Efectividade')
      .first()

    // feminino
    const femininoEspecialAtivo = await queryEfectivos.clone()
      .where('pessoafisicas.genero', 'F') // Especial
      .where('pessoafisicas.regime_id', 1)
      .where('sigpq_situacao_estados.nome', 'Efectividade')
      .first()

    // Masculino
    const masculinoGeralAtivo = await queryEfectivos.clone()
    .where('pessoafisicas.genero', 'M') // Geral
    .where('pessoafisicas.regime_id', 2)
    .where('sigpq_situacao_estados.nome', 'Efectividade')
    .first()

  // feminino
  const femininoGeralAtivo = await queryEfectivos.clone()
    .where('pessoafisicas.genero', 'F') // Geral
    .where('pessoafisicas.regime_id', 2)
    .where('sigpq_situacao_estados.nome', 'Efectividade')
    .first()

    // Masculino
    const masculinoGeralPassivo = await queryEfectivos.clone()
    .where('pessoafisicas.genero', 'M') // Geral
    .where('pessoafisicas.regime_id', 2)
    .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
    .first()

  // feminino
  const femininoGeralPassivo = await queryEfectivos.clone()
    .where('pessoafisicas.genero', 'F') // Geral
    .where('pessoafisicas.regime_id', 2)
    .where('sigpq_situacao_estados.nome', '<>', 'Efectividade')
    .first()

       /*  return {
          especial: [
            {
              id: 2,
              nome: 'Regime Especial',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: regimeEspecial.total || 0,
              url: { id: 'regimeId', valor: 1 },
            },
            {
              id: 10,
              nome: 'Masculino (Activo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoEspecialAtivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Feminino (Activo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoEspecialAtivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
            {
              id: 10,
              nome: 'Masculino (Passivo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoEspecialPassivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Feminino (Passivo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoEspecialPassivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
            {
              id: 12,
              nome: 'Força Activa (Especial)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaActivaEspecial.total || 0,
              url: { id: 'forcaActiva', valor: 1 },
            },
            {
              id: 12,
              nome: 'Força Passiva (Especial)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaPassivaEspecial.total || 0,
              url: { id: 'forcaPassiva', valor: 1 },
            },
          ],
          geral: [
            {
              id: 3,
              nome: 'Regime Geral',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: regimeGeral.total || 0,
              url: { id: 'regimeId', valor: 2 },
            },
            {
              id: 10,
              nome: 'Masculino (Ativo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoGeralAtivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Feminino (Ativo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoGeralAtivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },{
              id: 10,
              nome: 'Masculino (Passivo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoGeralPassivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Feminino (Passivo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoGeralPassivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
            {
              id: 12,
              nome: 'Força Activa (Geral)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaActivaGeral.total || 0,
              url: { id: 'forcaActiva', valor: 1 },
            },
            {
              id: 12,
              nome: 'Força Passiva (Geral)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaPassivaGeral.total || 0,
              url: { id: 'forcaPassiva', valor: 1 },
            },
          ],
          efectivos_ativos: [
            {
              id: 1,
              nome: 'Total de Efectivo',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaActivaEspecial.total || 0,
              totalPassivo: '0 Inactivo',
              url: { id: 'tipoVinculoId', valor: 1 },
            },
            {
              id: 4,
              nome: 'Oficial Comissário',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: oficialComissarioAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '7' },
            },
            {
              id: 5,
              nome: 'Oficial Superior',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: oficialSuperiorAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '8' },
            },
            {
              id: 6,
              nome: 'Oficial Subalterno',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: subAlternoAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '9' },
            },
            {
              id: 7,
              nome: 'Subchefe',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: subChefeAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '10' },
            },
            {
              id: 8,
              nome: 'Agente',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: agenteAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '11' },
            },
          ],efectivos_passivo: [
            {
              id: 1,
              nome: 'Total de Efectivo',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaPassivaEspecial.total || 0,
              totalPassivo: '0 Inactivo',
              url: { id: 'tipoVinculoId', valor: 1 },
            },
            {
              id: 4,
              nome: 'Oficial Comissário',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: oficialComissarioPassivo.total || 0,
              url: { id: 'patenteClasse', valor: '7' },
            },
            {
              id: 5,
              nome: 'Oficial Superior',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: oficialSuperiorPassivo.total || 0,
              url: { id: 'patenteClasse', valor: '8' },
            },
            {
              id: 6,
              nome: 'Oficial Subalterno',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: subAlternoPassivo.total || 0,
              url: { id: 'patenteClasse', valor: '9' },
            },
            {
              id: 7,
              nome: 'Subchefe',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: subChefePassivo.total || 0,
              url: { id: 'patenteClasse', valor: '10' },
            },
            {
              id: 8,
              nome: 'Agente',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: agentePassivo.total || 0,
              url: { id: 'patenteClasse', valor: '11' },
            },
          ],
          resumo:[
            {
              id: 1,
              nome: 'Total de Efectivo',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: efectivosTotal.total || 0,
              totalPassivo: '0 Inactivo',
              url: { id: 'tipoVinculoId', valor: 1 },
            },
            {
              id: 2,
              nome: 'Regime Especial',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: regimeEspecial.total || 0,
              url: { id: 'regimeId', valor: 1 },
            },
            {
              id: 3,
              nome: 'Regime Geral',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: regimeGeral.total || 0,
              url: { id: 'regimeId', valor: 2 },
            }
          ]
        }; */


        return {
          especial: [
            {
              id: 2,
              nome: 'Regime Especial',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: regimeEspecial.total || 0,
              url: { id: 'regimeId', valor: 1 },
            },
            {
              id: 10,
              nome: 'Masculino (Activo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoEspecialAtivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Femenino (Activo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoEspecialAtivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
            {
              id: 10,
              nome: 'Masculino (Passivo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoEspecialPassivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Femenino (Passivo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoEspecialPassivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
            {
              id: 12,
              nome: 'Força Activa (Especial)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaActivaEspecial.total || 0,
              url: { id: 'forcaActiva', valor: 1 },
            },
            {
              id: 12,
              nome: 'Força Passiva (Especial)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaPassivaEspecial.total || 0,
              url: { id: 'forcaPassiva', valor: 1 },
            },
          ],
          geral: [
            {
              id: 3,
              nome: 'Regime Geral',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: regimeGeral.total || 0,
              url: { id: 'regimeId', valor: 2 },
            },
            {
              id: 10,
              nome: 'Masculino (Ativo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoGeralAtivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Feminino (Ativo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoGeralAtivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },{
              id: 10,
              nome: 'Masculino (Passivo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoGeralPassivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Feminino (Passivo)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoGeralPassivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
            {
              id: 12,
              nome: 'Força Activa (Geral)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaActivaGeral.total || 0,
              url: { id: 'forcaActiva', valor: 1 },
            },
            {
              id: 12,
              nome: 'Força Passiva (Geral)',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaPassivaGeral.total || 0,
              url: { id: 'forcaPassiva', valor: 1 },
            },
          ],geral_efectivo_passivo: [

            {
              id: 12,
              nome: 'Total de Efectivo Geral Passivo',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaPassivaGeral.total || 0,
              url: { id: 'forcaPassiva', valor: 1 },
            },
            {
              id: 10,
              nome: 'Masculino',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoGeralPassivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Feminino',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoGeralPassivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
          ],
          geral_efectivo_ativo: [
            {
              id: 12,
              nome: 'Total de Efectivo Geral Activo',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaActivaGeral.total || 0,
              url: { id: 'forcaActiva', valor: 1 },
            },
            {
              id: 10,
              nome: 'Masculino',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoGeralAtivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            },
            {
              id: 11,
              nome: 'Feminino',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoGeralAtivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            }

          ],
          especial_efectivos_ativos: [
            {
              id: 1,
              nome: 'Total de Efectivo Especial Activo',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaActivaEspecial.total || 0,
              totalPassivo: '0 Inactivo',
              url: { id: 'tipoVinculoId', valor: 1 },
            },
            {
              id: 4,
              nome: 'Oficial Comissário',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: oficialComissarioAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '7' },
            },
            {
              id: 5,
              nome: 'Oficial Superior',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: oficialSuperiorAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '8' },
            },
            {
              id: 6,
              nome: 'Oficial Subalterno',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: subAlternoAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '9' },
            },
            {
              id: 7,
              nome: 'Subchefe',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: subChefeAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '10' },
            },
            {
              id: 8,
              nome: 'Agente',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: agenteAtivo.total || 0,
              url: { id: 'patenteClasse', valor: '11' },
            },
            {
              id: 9,
              nome: 'Femenino',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoEspecialAtivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
            {
              id: 10,
              nome: 'Masculino',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoEspecialAtivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            }
          ],especial_efectivos_passivo: [
            {
              id: 1,
              nome: 'Total de Efectivo Especial Passivo',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: forcaPassivaEspecial.total || 0,
              totalPassivo: '0 Inactivo',
              url: { id: 'tipoVinculoId', valor: 1 },
            },
            {
              id: 4,
              nome: 'Oficial Comissário',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: oficialComissarioPassivo.total || 0,
              url: { id: 'patenteClasse', valor: '7' },
            },
            {
              id: 5,
              nome: 'Oficial Superior',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: oficialSuperiorPassivo.total || 0,
              url: { id: 'patenteClasse', valor: '8' },
            },
            {
              id: 6,
              nome: 'Oficial Subalterno',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: subAlternoPassivo.total || 0,
              url: { id: 'patenteClasse', valor: '9' },
            },
            {
              id: 7,
              nome: 'Subchefe',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: subChefePassivo.total || 0,
              url: { id: 'patenteClasse', valor: '10' },
            },
            {
              id: 8,
              nome: 'Agente',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: agentePassivo.total || 0,
              url: { id: 'patenteClasse', valor: '11' },
            },
            {
              id: 9,
              nome: 'Femenino',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: femininoEspecialPassivo.total || 0,
              url: { id: 'genero', valor: 'F' },
            },
            {
              id: 10,
              nome: 'Masculino',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: masculinoEspecialPassivo.total || 0,
              url: { id: 'genero', valor: 'M' },
            }
          ],
          resumo:[
            {
              id: 1,
              nome: 'Total de Efectivo',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: efectivosTotal.total || 0,
              totalPassivo: '0 Inactivo',
              url: { id: 'tipoVinculoId', valor: 1 },
            },
            {
              id: 2,
              nome: 'Regime Especial',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: regimeEspecial.total || 0,
              url: { id: 'regimeId', valor: 1 },
            },
            {
              id: 3,
              nome: 'Regime Geral',
              icone: 'perfil-d bi bi-person-circle',
              descricao: 111,
              total: regimeGeral.total || 0,
              url: { id: 'regimeId', valor: 2 },
            }
          ]
        };

    } catch (e) {
      console.log(e);
      return Error('Não foi possível listar os dashboards.');
    }

  }
}
