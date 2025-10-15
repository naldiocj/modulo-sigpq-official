function validarCargo(input: any) {

    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

    try {

        const camposDesejados: any[] = ['patente_id','numero_despacho_nomeacao','data_despacho_nomeacao','pessoajuridica_id','pessoafisica_id', 'situacao', "sigpq_tipo_cargo_id", 'sigpq_acto_nomeacao_id','user_id'];

        const valoresIniciais: any[] = [
            'descricao'
        ];

        return mapearCampos(input, camposDesejados, valoresIniciais) as any[];

    } catch (error) {
        return error.message as string
    }

}

module.exports = validarCargo
