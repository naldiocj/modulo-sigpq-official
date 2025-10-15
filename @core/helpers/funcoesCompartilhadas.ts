// Exporta a função limparFiltroCaptarSomenteQuemTiverValor
export const funcaoCompoatilhada_limparFiltroCaptarSomenteQuemTiverValor = (obj: any) => {
  // Filtra as entradas do objeto, removendo chaves com valores null ou undefined
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined && value !== 'null')
  );
};

// Função para verificar se uma string é válida
export const funcaoCompoatilhada_isValidString = (value: any): boolean => {
  return (typeof value === 'string' && value.trim() !== '') || typeof value === 'number';
};

export const qualOrgaoSelecionar = ((options: any) => {

  if (options.user.aceder_departamento) {
    return options.orgao_detalhes.sigpq_tipo_departamento !== 0
      ? options.orgao_detalhes.sigpq_tipo_departamento.id
      : options.orgao.id;
  }

  if (options.user.aceder_seccao) {
    return options.orgao_detalhes.sigpq_tipo_departamento !== 0
      ? options.orgao_detalhes.sigpq_tipo_departamento.id
      : options.orgao.id;
  }

  if (options.user.aceder_posto_policial) {
    return options.orgao_detalhes.sigpq_tipo_departamento !== 0
      ? options.orgao_detalhes.sigpq_tipo_departamento.id
      : options.orgao.id;
  }
  return options.orgao.id;

})

