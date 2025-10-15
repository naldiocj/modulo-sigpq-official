
declare module '@ioc:Adonis/Core/Event' {
  interface EventsList {
    'update:redis:in:funcionario': {
      orgaoUsuarioLogado: string,
      previlegio: string,
      orgaoNovo: string,
      dadosAntigoFuncionario: any,
      dadosNovoFuncionario: any,
    },
    'insert_or_search:id:funcionario': {
      orgaoUsuarioLogado: string,
      options: any,
    }
  }
}
import Event from '@ioc:Adonis/Core/Event'
import RedisService from '../../../../../app/@piips/shared/service/redis/RedisService';
import CrudBaseRepository from '../repositories/crud-base-repositorio';
const updateDashboard = (dadosAntigos: any, dadosNovos: any): boolean => {

  return ((dadosAntigos.regime_id != dadosNovos.regime_id) ||
    (dadosAntigos.patente_id != dadosNovos.patente_id)
    || (dadosAntigos.genero != dadosNovos.genero) ||
    (dadosAntigos.sigpq_situacao_id != dadosNovos.sigpq_situacao_id))

}

const updateListagem = (dadosAntigos: any, dadosNovos: any): boolean => {
  return ((dadosAntigos.nip != dadosNovos.nip) ||
    (dadosAntigos.patente_id != dadosNovos.patente_id)
    || (dadosAntigos.numero_agente != dadosNovos.numero_agente)
    || (dadosAntigos.nome_completo != dadosNovos.nome_completo)
    || (dadosAntigos.sigpq_documentos[0]?.nid != dadosNovos.sigpq_documentos[0]?.nid)
    || (dadosAntigos.sigpq_tipo_orgao.id != dadosNovos.sigpq_tipo_orgao.id)
    || (dadosAntigos.sigpq_situacao_id != dadosNovos.sigpq_situacao_id)
  )

}
const redis = new RedisService();
const crud = new CrudBaseRepository()
const name = 'funcionario'

Event.on('update:redis:in:funcionario', (user) => {
  if (updateDashboard(user.dadosAntigoFuncionario, user.dadosNovoFuncionario)) {

    Event.emit('update:redis:in:dashboard_novo', {
      orgaoNovo: user.orgaoNovo,
      orgaoUsuarioLogado: user.orgaoUsuarioLogado,
      previlegio: user.previlegio,
    });

    Event.emit('update:redis:in:dashboard', {
      orgaoNovo: user.orgaoNovo,
      orgaoUsuarioLogado: user.orgaoUsuarioLogado,
      previlegio: user.previlegio,
    });

  }

  if (updateListagem(user.dadosAntigoFuncionario, user.dadosNovoFuncionario)) {
    Event.emit('update:redis:in:search:funcionario', {
      orgaoNovo: user.orgaoNovo,
      orgaoUsuarioLogado: user.orgaoUsuarioLogado,
      previlegio: user.previlegio,
    });
  }//else console.log("Nenhuma listagem necessita de atualização no redis")
})

Event.on('update:redis:in:search:funcionario', async (user) => {
  const quantidadeDeAcessos = {
    ACESSO_MINIMO: 5,
    ACESSO_MAXIMO: 10
  };
  // Dados propriamente atualizados: { orgaoNovo: 482, orgaoUsuarioLogado: 'all', previlegio: 'all' }
  setImmediate(async () => {
    try {
      // Função auxiliar para carregar pesquisas
      async function carregarPesquisas(orgao: string): Promise<void> {
        const pesquisas = await redis.getMoreAcessKeys(name, orgao, (orgao == 'all' ? quantidadeDeAcessos.ACESSO_MINIMO : quantidadeDeAcessos.ACESSO_MAXIMO));
        //const temDefaultVazia = await verificarSeAConsultaPrincipalVaziaEstaPresente(pesquisas, orgao);
        await pegarAspesuisasmaisAcessadasEPrecarregar(pesquisas, orgao);
        await eliminarTodasOutrasChavesForaDasMaisAcessadas(pesquisas, orgao)
      }

      // Carrega as pesquisas para o orgão do usuário logado
      await carregarPesquisas(user.orgaoUsuarioLogado);

      // Carrega as pesquisas para o novo orgão, se houver
      await carregarPesquisas(user.orgaoNovo);

      // Se o orgão do usuário logado não for 'all', carrega também para 'all'
      if (user.orgaoUsuarioLogado !== 'all') {
        await carregarPesquisas('all');
      }
    } catch (error) {
      console.error("Erro ao processar as pesquisas em segundo plano:", error);
    }
  });
});

async function eliminarTodasOutrasChavesForaDasMaisAcessadas(pesquisas: any, key: string) {
  const keyStorage = `search:${name}:orgao:${key}:hash:*`;
  const todasChaves = await redis.getKeys(keyStorage)
  const chavesMaisAcessadasSet = new Set(pesquisas);
  for (const chave of todasChaves) {
    if (!chavesMaisAcessadasSet.has(chave)) {
      await redis.deleteUnlink(chave);
      //console.log(`Removida chave: ${chave}`);
    }
  }
}


async function pegarAspesuisasmaisAcessadasEPrecarregar(pesquisas: any, key: string) {
  if (!pesquisas) return;

  for (const chave of pesquisas) {
    try {
      const filtros = await redis.retrieveHashField(chave, 'filters');
      if (filtros) {
        await armazenarNoRedis(key, JSON.parse(filtros));
      }

    } catch (error) {
      await redis.eliminarUmaKey(chave);
      console.error(`Erro ao processar chave ${chave}:`, error);
    }
  }
}

async function armazenarNoRedis(key, filtros) {
  await redis.armazenaNoRedisNoFinalRetornaResultado(name, key, filtros, crud);
}
