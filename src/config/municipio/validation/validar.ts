function validarMunicipio(input: any) {

    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

    try {

        const obrigatio: any[] = ['nome', 'user_id', 'provincia_id'];
        const naoObrigatio: any[] = ['activo', 'descricao'];

        return mapearCampos(input, obrigatio, naoObrigatio);

    } catch (error) {
        return error.message as string
    }

}

module.exports = validarMunicipio
