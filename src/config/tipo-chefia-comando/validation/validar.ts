function validarTipoCargo(input: any) {

    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos') 

    try {

        const camposDesejados: any[] = ['nome', 'sigla', 'descricao', 'user_id'];

        const valoresIniciais: any[] = [
            'descricao'
        ];

        return mapearCampos(input, camposDesejados, valoresIniciais) as any[];

    } catch (error) {
        return error!.message as string
    }

}

module.exports = validarTipoCargo
