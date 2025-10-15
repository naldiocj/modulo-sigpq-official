function validarCurso(input: any) {

    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

    try {

        const obrigatio: any[] = ['pessoafisica_id', 'sigpq_estado_id', 'data_inicio_inatividade','user_id','duracao_inatividade','sigpq_estado_reforma_id','sigpq_situacao_id'];
        const naoObrigatio: any[] = ['activo', 'descricao'];

        return mapearCampos(input, obrigatio, naoObrigatio);

    } catch (error) {
        return error.message as string
    }

}

module.exports = validarCurso
