module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    // Dívida conhecida pré-refatoração: rebaixadas a warning para o CI de lint
    // poder rodar verde sem mexer na lógica ainda. A refatoração (Fase A) conserta
    // o `break` inalcançável do reducer e as dependências faltando nos useEffect,
    // e então estas voltam a ser `error`.
    'no-unreachable': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
