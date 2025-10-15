import Database from "@ioc:Adonis/Lucid/Database";

export default class ListarPorPessoaRepository {
  public async execute(
    pessoa_id: number,
    emTempo: boolean = true
  ): Promise<any> {
    try {
      let query = Database.from({
        f: "sigpq_funcionarios",
      })
        .select(
          Database.raw("upper(pessoas.nome_completo) as nome_completo"),
          "pessoas.activo",
          "pessoafisicas.genero",
          "f.nip",
          "f.numero_processo",
          "f.numero_agente",
          "f.foto_efectivo",
          "f.descricao",
          "patentes.nome as patente_nome",
          "patentes.sigpq_tipo_carreira_id as patente_classe",
          "patentes.classe as patenteClasse",
          "f.id",
          "patentes.id as patente_id",
          // 'sigpq_provimentos.data_provimento',
          "patentes.duracao",
          "sigpq_provimentos.ordem_descricao",
          "sigpq_provimentos.despacho_descricao",
          "regimes.quadro",
          "pessoajuridicas.sigla as orgao_sigla",
          "orgao.nome_completo as orgao",
          "sigpq_acto_progressaos.nome as acto",

          Database.raw(
            "YEAR(DATE(sigpq_provimentos.data_provimento)) as ano_acto"
          ),
          Database.raw(
            "(YEAR(NOW()) - YEAR(DATE(sigpq_provimentos.data_provimento))) as acto_duracao"
          ),
          Database.raw(
            "DATE_FORMAT(sigpq_provimentos.data_provimento, '%d/%m/%Y %H:%i:%s') as data_provimento"
          ),
          Database.raw("DATE_FORMAT(f.data_adesao, '%d/%m/%Y') as data_adesao"),
          Database.raw(
            "DATE_FORMAT(pessoafisicas.data_nascimento, '%d/%m/%Y') as data_nascimento"
          ),
          Database.raw(
            "DATE_FORMAT(sigpq_provimentos.created_at, '%d/%m/%Y %H:%i:%s') as created_at"
          ),
          Database.raw(
            "DATE_FORMAT(sigpq_provimentos.updated_at, '%d/%m/%Y %H:%i:%s') as updated_at"
          )
        )
        .innerJoin("pessoas", "pessoas.id", "f.id")
        .innerJoin("pessoafisicas", "pessoafisicas.id", "f.id")
        .innerJoin(
          "sigpq_provimentos",
          "sigpq_provimentos.pessoa_id",
          "pessoas.id"
        )
        .innerJoin(
          "sigpq_funcionario_orgaos",
          "sigpq_funcionario_orgaos.pessoafisica_id",
          "f.id"
        )
        .innerJoin(
          "pessoajuridicas",
          "pessoajuridicas.id",
          "sigpq_funcionario_orgaos.pessoajuridica_id"
        )
        .innerJoin("pessoas as orgao", "orgao.id", "pessoajuridicas.id")
        .innerJoin("patentes", "patentes.id", "sigpq_provimentos.patente_id")
        .innerJoin("regimes", "regimes.id", "pessoafisicas.regime_id")
        .innerJoin(
          "sigpq_acto_progressaos",
          "sigpq_acto_progressaos.id",
          "sigpq_provimentos.acto_progressao_id"
        )
        .leftJoin(
          "sigpq_funcionario_estados as fe",
          "fe.pessoafisica_id",
          "f.id"
        )
        .leftJoin(
          "sigpq_situacao_estados as se",
          "se.id",
          "fe.sigpq_situacao_id"
        )
        .leftJoin("sigpq_estados as es", "es.id", "fe.sigpq_estado_id")
        // .where('sigpq_funcionario_orgaos.activo', true)
        .where("pessoas.eliminado", false)
        // .where('pessoafisicas.estado', 'activo')
        .where("sigpq_provimentos.activo", true)
        .where("sigpq_provimentos.situacao", "actual")
        .where("sigpq_provimentos.eliminado", false)
        .where("sigpq_funcionario_orgaos.activo", true)
        .where("sigpq_funcionario_orgaos.eliminado", false)
        .where("se.nome", "efectividade")
        .orderBy("acto_duracao", "asc")
        .where("f.id", pessoa_id);
      if (emTempo) {
        query.whereRaw(
          `
                CASE
                WHEN DATE(sigpq_provimentos.data_provimento) < CURDATE() THEN
                TIMESTAMPDIFF(YEAR, sigpq_provimentos.data_provimento, CURDATE()) >  patentes.duracao
                END
                `
        );
      }

      

      return await query.first();
    } catch (e) {
      console.log(e);
      return Error("Não foi possível listar os registos.");
    }
  }
}
