declare module '@ioc:Adonis/Core/Event' {
  interface EventsList {
    'update:redis:in:dashboard_novo': {
      orgaoUsuarioLogado:string,
      previlegio:string,
      orgaoNovo:string
    },
    'insert_or_search:id:dashboard_novo': {
      orgaoUsuarioLogado:string,
      options:any,
    }
  }
}
import Event from '@ioc:Adonis/Core/Event'
import RedisService from '../../../../../app/@piips/shared/service/redis/RedisService';
import ListarNovaEstruturaRepository from '../repositories/listar-repositorio-nova-estrutura';
const redis= new RedisService();
const crud  = new ListarNovaEstruturaRepository()
const name='dashboard_novo'
Event.on('update:redis:in:dashboard_novo', async (user) => {

  const key = user.previlegio == 'all' ? 'all' : user.orgaoUsuarioLogado;
  await atualizarCache(key, user,true);
  if(key!='all')await atualizarCache('all', user);//se for um outro órgão atualzia todos os alls
});


Event.on('insert_or_search:id:dashboard_novo', async (user) => {
  const resultado = await
  redis.verificarSeExisteEArmazenaNoRedisNoFinalRetornaResultado(name,
    user.orgaoUsuarioLogado, user.options, crud,'dashboard_novo');
  // Aqui você pode chamar a função de callback
  return resultado
});


Event.on('new:dashboard_novo_particular', async (user) => {
  const key = user.orgaoNovo;
  await atualizarCache(key);
});



Event.onError(async (event, error, eventData) => {
  console.error(`Erro no evento ${event}: ${error.message}`);
  if (['update:redis:in:dashboard_novo', 'new:dashboard_novo_particular'].includes(event)) {
    await limparCache(eventData.orgaoNovo);
  }
});

async function limparCache(orgaoNovo) {
  try {
    const pattern = `search:${name}:orgao:${orgaoNovo}:hash:*`;
    const chave = await redis.getKeys(pattern);
    await Promise.all(
      chave.map(async (chave) => {
        await redis.eliminarUmaKey(chave);
      })
  );

  } catch (error) {}
}


async function armazenarNoRedis(key, filtros) {
  await redis.armazenaNoRedisNoFinalRetornaResultado('dashboard_novo', key, filtros, crud,'dashboard_novo');
}

async function atualizarCache(key, user:any = null, dashboard_novoAll = false) {
  const pattern = `search:${name}:orgao:${key}:hash:*`;
  const chaves = await redis.getKeys(pattern);

  // Se for necessário, execute o código relacionado ao dashboard_novo antes do loop
  if (dashboard_novoAll && user?.orgaoNovo !== user?.orgaoUsuarioLogado && user?.orgaoNovo) {
      // Atualizar a dashboard_novo do órgão específico (somente uma vez)
      Event.emit('new:dashboard_novo_particular', { orgaoNovo: user.orgaoNovo });
  }

  // Processar todas as chaves em paralelo usando Promise.all
  await Promise.all(
      chaves.map(async (chave) => {
          try {
              const filtros = await redis.retrieveHashField(chave, 'filters');

              if (filtros !== null) {
                  await armazenarNoRedis(key, JSON.parse(filtros));
              }
          } catch (error) {
              await redis.eliminarUmaKey(chave); // Eliminar a chave com erro
              console.log("Erro na parte de armazenar no redis:", error);
          }
      })
  );
}

