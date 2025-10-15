function validarTipoFuncao(input: any) {

    const mapearCampos = require('App/@piips/shared/metodo-generico/MapearCampos')

    try {

      let camposDesejados: any[] = ['tipo_licenca_id', 'pessoafisica_id', 'user_id', 'mes', 'ano'];

      if (input.resposta && input.motivo) {
        camposDesejados.push('resposta', 'motivo');
      } else if (input.resposta) {
        camposDesejados.push('resposta');
      } else if (input.motivo) {
        camposDesejados.push('motivo');
      }

        const valoresIniciais: any[] = [
            'descricao'
        ];

        return mapearCampos(input, camposDesejados, valoresIniciais) as any[];

    } catch (error) {
        return error.message as string
    }

}

module.exports = validarTipoFuncao
