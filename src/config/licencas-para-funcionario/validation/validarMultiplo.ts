function validarTipoFuncao(input: any) {

    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

    try {

        const camposDesejados: any[] = ['tipo_licenca_id', 'pessoafisica_id', 'user_id','situacao','dias_selecionados'];

        const valoresIniciais: any[] = [
            'descricao'
        ];

        return mapearCampos(input, camposDesejados, valoresIniciais) as any[];

    } catch (error) {
        return error.message as string
    }

}

module.exports = validarTipoFuncao
