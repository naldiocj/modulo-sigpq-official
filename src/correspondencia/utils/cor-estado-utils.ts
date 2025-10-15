


export const pendente = (): string => {
    return '#6c757d'
}
export const expadir = (): string => {
    return 'rgb(254, 176, 25)'
}

export const despachado = (): string => {
    return 'rgb(64, 232, 22)'
}

export const saiu = (): string => {
    return 'rgb(0, 143, 251)'
}



export const estado = (key: string): string => {
    const estados: any = {
        'P': {
            estado: 'Pendente'
        },
        'D': {

            estado: 'Despacho'
        },
        'S': {
            estado: 'Saído'
        },
        'E': {
            estado: 'Expedido'
        },
        'PR': {
            estado: 'Pronunciamento'
        },
        'PA': {
            estado: 'Parecer'
        },

    }

    return estados.hasOwnProperty(key) ? estados[key].estado : null;
}


module.exports = {
    estado,
    pendente,
    despachado,
    saiu,
    expadir
}