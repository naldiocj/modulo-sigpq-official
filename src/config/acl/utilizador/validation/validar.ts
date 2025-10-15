function validarUtilizador(input: any) {

    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos') 

    try {

        const camposDesejados: any[] = ['username', 'email', 'password', 'pessoa_id', 'user_id'];

        const valoresIniciais: any[] = [
            'notificar_por_email',
            'forcar_alterar_senha',
            'descricao'
        ];

        return mapearCampos(input, camposDesejados, valoresIniciais) as any[];

    } catch (error) {
        return error.message as string
    }

}

module.exports = validarUtilizador
