import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'
export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method "sigpq_situacao_estados"

    const resultado = await Database
    .from("sigpq_situacao_estados") // substitua 'sua_tabela' pelo nome da sua tabela
    .where('nome', 'LIKE', `%Inactivo%`)
    .first();

if(resultado?.id)
{
  const resultados = await Promise.all([
    this.atualizarAlgumasInformacoes_naTabelaEstadosCorrespondente('Licença Registada ou Ilimitada',resultado.id),
    this.atualizarAlgumasInformacoes_naTabelaEstadosCorrespondente('Cumprimento de Pena de Prisão Maior',resultado.id),
    this.atualizarAlgumasInformacoes_naTabelaEstadosCorrespondente('Extinção de Vínculo Laboral',resultado.id),
]);
}else console.log("Não encontrado a opção Inactivo, porfavor Rode a seeds 71")
       


  }

  async atualizarAlgumasInformacoes_naTabelaEstadosCorrespondente(nome_situacao_Estado:string,sigpq_situacao_id:string)
  {
    const busca=nome_situacao_Estado
    const resultado = await Database
    .from("sigpq_estados") // substitua 'sua_tabela' pelo nome da sua tabela
    .where('nome', 'LIKE', `${busca}`)
    .update({
      sigpq_situacao_id: sigpq_situacao_id
  });

  }
}
