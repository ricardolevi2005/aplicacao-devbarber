# Análise & Plano de Refatoração — DevBarber

> Documento de análise técnica da aplicação **DevBarber** (React Native), com
> inventário de problemas e um plano de refatoração **incremental** que mantém
> as principais stacks. Nenhuma alteração de código foi aplicada — este arquivo
> serve como base para discussão e priorização.

## Sumário da aplicação

App mobile de agendamento com barbeiros (tutorial B7Web).

| Camada        | Stack                                                             |
|---------------|------------------------------------------------------------------|
| Runtime       | React Native 0.64 + React 17                                     |
| Navegação     | React Navigation 5 (`Stack` + `BottomTabs`)                      |
| Estado global | Context API + `useReducer`                                       |
| Estilização   | `styled-components/native`                                       |
| API/HTTP      | `fetch` (`src/Api.js`)                                           |
| Persistência  | `@react-native-community/async-storage` (token)                 |
| Localização   | `@react-native-community/geolocation` + `react-native-permissions` |

### Estrutura de pastas
```
src/
├── Api.js                # camada HTTP (fetch)
├── assets/               # ícones .svg
├── components/           # BarberItem, BarberModal, CustomTabBar, SignInput, Stars
├── contexts/             # UserContext (Context API)
├── reducers/             # UserReducer
├── screens/              # Preload, SignIn, SignUp, Home, Barber, Search,
│                         #   Favorites, Appointments, Profile (index.js + styles.js)
└── stacks/               # MainStack (stack) + MainTab (bottom tabs)
```

---

## Inventário de problemas

### 🔴 Bugs (prioridade alta)

| # | Arquivo | Problema | Impacto |
|---|---------|----------|---------|
| 1 | `src/contexts/UserContext.js` | Importa/usa `intialState` (erro de digitação); o reducer exporta `initialState`. `useReducer` recebe `undefined`. | Estado global inicia sem forma definida; `CustomTabBar` lê `user.avatar` sobre estado potencialmente indefinido. |
| 2 | `src/reducers/UserReducer.js` | Campo `appoitments` (typo) e `break` inalcançável após `return`. | Estado inconsistente; código morto. |
| 3 | `src/screens/Profile/index.js` | `logout` chama a API mas **não remove o token** do `AsyncStorage`. | Sessão "fantasma": token persiste após logout. |
| 4 | `src/components/BarberModal.js` | A chamada `Api.setAppointment(...)` está **comentada**; o fluxo apenas navega. | **Agendamento nunca é persistido** no backend. |
| 5 | `src/screens/Home/index.js` | `getBarbers()` é chamado dentro do callback de `Geolocation.getCurrentPosition` logo após `setCoords(...)`; o estado `coords` ainda está desatualizado. | Primeira busca por GPS envia `latitude/longitude` nulos. |
| 6 | `src/screens/Home/index.js` | `onRefresh` faz `setRefreshing(false)` no início. | O spinner de pull-to-refresh nunca aparece. |

### 🟠 Duplicação / manutenção

- **`src/Api.js`**: 9 métodos quase idênticos repetindo `headers`, `JSON.stringify`,
  `await req.json()` e leitura manual do token (~115 linhas). Sem `try/catch` para
  falhas de rede. **Oportunidade**: extrair um helper único `request()` mantendo a
  interface pública intacta.

### 🟡 Código morto / padronização

- `src/screens/Barber/index.js`: imports não usados (`SwitchComponent`, `Text`) e
  `console.log(json.data.available)` esquecido.
- `alert()` (do JS) usado em vez de `Alert.alert()` (idiomático do RN) em
  `Home`, `SignIn`, `SignUp`, `Barber`, `BarberModal`.
- Comparações `==` em vez de `===` (`Barber/index.js`, `BarberModal.js`).
- `src/components/BarberModal.js`: import comentado e `setShow(false)` sem `;`.
- Cores hardcoded repetidas (`#4eadbe`, `#268596`, `#83d6e3`, `#ff9200`, `#fff`)
  espalhadas pelos styled-components.

### ℹ️ Observações (fora do escopo de bug)

- Telas `Search`, `Favorites`, `Appointments` são apenas stubs (`<Text>`).
- Cobertura de testes mínima: apenas `__tests__/App-test.js` (render do App).

---

## Plano de refatoração (incremental, mantendo as stacks)

> Restrições adotadas: **manter JavaScript** (sem TypeScript), **manter versões**
> das dependências, **sem reestruturação de pastas**.

### Fase A — Correção de bugs
1. `UserContext`: corrigir para `initialState`.
2. `UserReducer`: `appointments` + remover `break` morto.
3. `Profile`: `await AsyncStorage.removeItem('token')` no logout.
4. `BarberModal`: reabilitar `Api.setAppointment` com tratamento de erro
   (`Alert` no erro; `setShow(false)` + navegação no sucesso).
5. `Home`: parametrizar `getBarbers(coords)` para usar coordenadas frescas do GPS.
6. `Home`: corrigir `onRefresh` (ativar/desativar o spinner em torno do `await`).

### Fase B — Robustez do `Api.js`
- Extrair helper privado `request(path, { method, body, auth })`: monta headers,
  injeta token quando necessário, faz `fetch`, trata `try/catch` e retorna JSON.
- Centralizar `BASE_API`. **Manter a interface pública** (`signIn`, `getBarbers`, …)
  para não tocar nas telas.

### Fase C — Limpeza e padronização
- Remover imports/`console.log` mortos.
- `alert()` → `Alert.alert()`.
- `==` → `===`.

### Fase D — (Opcional) Tema de cores
- `src/theme/colors.js` exportando a paleta; referenciar nos styled-components
  (sem sair do styled-components).

### Fora de escopo
- Migração para TypeScript.
- Upgrade de RN/bibliotecas (ex.: `async-storage` community → `@react-native-async-storage`).
- Reestruturação de pastas / camada de serviços / custom hooks.
- Implementação das telas-stub (Search/Favorites/Appointments).

---

## Verificação proposta
1. `yarn install`
2. `yarn lint` — eslint (`@react-native-community`) sem novos erros.
3. `yarn test` — teste de render deve continuar passando.
4. (Manual, com device/emulador) Fluxo: login → Home (com/sem GPS) → Barber →
   favoritar → agendar → logout.
