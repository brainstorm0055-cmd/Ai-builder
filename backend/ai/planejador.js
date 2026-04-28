export function criarPlano(analise) {
  return `
Tipo: ${analise.tipo}
Complexidade: ${analise.complexidade}
Recursos: ${analise.features.join(", ")}

Requisitos:
- UI moderna
- Responsivo
- Código limpo
- Estrutura profissional
`;
}
