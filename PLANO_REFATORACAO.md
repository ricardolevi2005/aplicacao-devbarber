# Plano Completo de Refatoração & Tasks — DevBarber

> Plano de execução detalhado da refatoração **incremental** da aplicação
> DevBarber, com checklist de tasks rastreáveis. Complementa o documento
> [`ANALISE_REFATORACAO.md`](./ANALISE_REFATORACAO.md), que contém o diagnóstico.

## Princípios e restrições

- **Manter as principais stacks**: React Native 0.64, React Navigation 5,
  Context API + `useReducer`, `styled-components`, `fetch`, `async-storage`.
- **Manter JavaScript** (sem migração para TypeScript).
- **Manter versões** das dependências (sem upgrades de RN/libs).
- **Sem reestruturação de pastas** — apenas correções, limpeza e desduplicação.
- Cada fase é um commit lógico, validado por `yarn lint` + `yarn test`.

---

## Roadmap por fases

### Fase A — Correção de bugs 🔴
Objetivo: restaurar comportamentos quebrados.

### Fase B — Robustez do `Api.js` 🟠
Objetivo: eliminar duplicação e adicionar tratamento de erro, sem mudar a interface.

### Fase C — Limpeza e padronização 🟡
Objetivo: remover código morto e padronizar APIs idiomáticas do RN.

### Fase D — Tema de cores (opcional)
Objetivo: centralizar a paleta de cores repetida.

### Fase E — Verificação
Objetivo: garantir lint/test verdes e validar o fluxo end-to-end.

---

## Tasks (checklist)

### Fase A — Correção de bugs
- [ ] **A1 — `UserContext` estado inicial.** Em `src/contexts/UserContext.js`,
  corrigir o import/uso de `intialState` para `initialState`.
- [ ] **A2 — `UserReducer` typo + código morto.** Em `src/reducers/UserReducer.js`,
  renomear `appoitments` → `appointments` e remover o `break` inalcançável.
- [ ] **A3 — Logout limpa token.** Em `src/screens/Profile/index.js`, adicionar
  `await AsyncStorage.removeItem('token')` antes do `navigation.reset` (importar
  `AsyncStorage`).
- [ ] **A4 — Persistir agendamento.** Em `src/components/BarberModal.js`, reabilitar
  `Api.setAppointment(...)` com tratamento de erro (`Alert` no erro; `setShow(false)`
  + `navigation.navigate('Appointments')` no sucesso). Remover import comentado e
  corrigir `setShow(false)` sem `;`.
- [ ] **A5 — Home coords do GPS.** Em `src/screens/Home/index.js`, parametrizar
  `getBarbers(coords)` para usar as coordenadas frescas do callback de
  `Geolocation.getCurrentPosition` (evita 1ª busca com lat/long nulos).
- [ ] **A6 — Home pull-to-refresh.** Em `src/screens/Home/index.js`, corrigir
  `onRefresh` para ativar/desativar `refreshing` corretamente em torno do `await`.

### Fase B — Robustez do `Api.js`
- [ ] **B1 — Helper `request`.** Em `src/Api.js`, extrair `request(path, { method,
  body, auth })` centralizando headers, injeção de token, `fetch` e parsing JSON.
- [ ] **B2 — Tratamento de erro.** Envolver em `try/catch`, retornando objeto de erro
  tratável (mantendo o contrato `{ error, data, ... }` consumido pelas telas).
- [ ] **B3 — Preservar interface pública.** Garantir que `checkToken`, `signIn`,
  `signUp`, `logout`, `getBarbers`, `getBarber`, `setFavorite`, `setAppointment`
  mantêm a mesma assinatura (telas não mudam).

### Fase C — Limpeza e padronização
- [ ] **C1 — Imports/console mortos.** Em `src/screens/Barber/index.js`, remover
  `SwitchComponent`, `Text` e o `console.log(json.data.available)`.
- [ ] **C2 — `alert()` → `Alert.alert()`.** Em `Home`, `SignIn`, `SignUp`, `Barber`,
  `BarberModal` (importar `Alert` do `react-native`).
- [ ] **C3 — `==` → `===`.** Em `Barber/index.js` e `BarberModal.js`.

### Fase D — Tema de cores (opcional)
- [ ] **D1 — Paleta centralizada.** Criar `src/theme/colors.js` e referenciar as cores
  repetidas (`#4eadbe`, `#268596`, `#83d6e3`, `#ff9200`, `#fff`) nos styled-components.

### Fase E — Verificação
- [ ] **E1 — `yarn install`.**
- [ ] **E2 — `yarn lint`** sem novos erros.
- [ ] **E3 — `yarn test`** (render do App) passando.
- [ ] **E4 — Teste manual** (device/emulador): login → Home (com/sem GPS) → Barber →
  favoritar → agendar (confirmar persistência) → logout (confirmar token removido).

---

## Mapa task → arquivo

| Task | Arquivo(s) |
|------|-----------|
| A1 | `src/contexts/UserContext.js` |
| A2 | `src/reducers/UserReducer.js` |
| A3 | `src/screens/Profile/index.js` |
| A4 | `src/components/BarberModal.js` |
| A5, A6 | `src/screens/Home/index.js` |
| B1–B3 | `src/Api.js` |
| C1, C3 | `src/screens/Barber/index.js`, `src/components/BarberModal.js` |
| C2 | `src/screens/{Home,SignIn,SignUp,Barber}/index.js`, `src/components/BarberModal.js` |
| D1 | `src/theme/colors.js` (novo) + styled-components |

---

## Fora de escopo (por decisão do usuário)
- Migração para TypeScript.
- Upgrade de RN/bibliotecas (ex.: `async-storage` community → `@react-native-async-storage`).
- Reestruturação de pastas / camada de serviços / custom hooks.
- Implementação das telas-stub (Search/Favorites/Appointments).
