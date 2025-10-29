import Event from "@ioc:Adonis/Core/Event";
import ListRepository from "../repositories/listar-repositorio";
import RedisService from "../../../../../app/@piips/shared/service/redis/RedisService";

import Redis from "@ioc:Adonis/Addons/Redis";
import generateCacheKey from "App/@piips/shared/metodo-generico/Gerar-Hash-Com-Base-Numa-String";

const redisService = new RedisService();
const listRepository = new ListRepository();
const name = "funcionario";

declare module "@ioc:Adonis/Core/Event" {
  interface EventsList {
    "update:funcionario": {
      key: any;
      keyStorage: any;
      options_aux: any;
    };
  }
}

Event.on("update:funcionario", async (data): Promise<any> => {
  const { key, keyStorage, options_aux } = data;
  if ((await redisService.retrieveHashField$(keyStorage, "results")) === null) {
    await redisService.storeHashField$(
      keyStorage,
      "results",
      JSON.stringify(await listRepository.listarTodos(options_aux))
    );
    redisService.storeHashField$(
      keyStorage,
      "filters",
      JSON.stringify(options_aux)
    );
  }

  await redisService.incrementAcesstoKey(
    `search:${name}:orgao:${key}:access_count`,
    keyStorage
  ); //aumenta as vezes de acesso

  await redisService.setExpiration(keyStorage, 4); // renova o tempo de expiração
});

export async function saveFuncionarioInRedisDB(data: any) {
  try {
    const { key, options } = data;
    const options_aux =
      await redisService.limparFiltroCaptarSomenteQuemTiverValor(options);
    const hash = await generateCacheKey(options_aux);
    const keyStorage = `search:${name}:orgao:${key}:hash:${hash}`;
    await Event.emit("update:funcionario", { key, keyStorage, options_aux });
    const result =  await redisService.obterResultadoDoRedis$(keyStorage);

     if (result && result.data && Array.isArray(result.data) && result.data.length === 0) {
      listRepository.listarTodos(options_aux).then(async (dados) => {
        await redisService.storeHashField$(
          keyStorage,
          "results",
          JSON.stringify(dados)
        );
        await redisService.storeHashField$(
          keyStorage,
          "filters",
          JSON.stringify(options_aux)
        );
      })
    }

    return result;
  } catch (error) {
    console.log(error);
  }
}
