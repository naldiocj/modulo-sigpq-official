function validarTipoFuncao(input: any) {

    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

    try {

        const camposDesejados: any[] = ['nome', 'situacao', 'user_id','dia_inicio','dia_fim','tipo_licenca_id'];

        const valoresIniciais: any[] = [
            'descricao'
        ];

        return mapearCampos(input, camposDesejados, valoresIniciais) as any[];

    } catch (error) {
        return error.message as string
    }

}

module.exports = validarTipoFuncao
