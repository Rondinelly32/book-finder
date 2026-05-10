# Plano: Sistema de Recomendação por Questionário

## Objetivo

Ajudar o usuário que terminou um livro e não sabe o que ler a seguir. Ele pode informar um livro de referência, responder um questionário sobre o que quer sentir lendo, ou ambos — e recebe recomendações personalizadas em português.

---

## Fluxo do usuário

### Caminho A: Tem um livro de referência

1. Usuário digita o livro que acabou de ler (ex: "Jack Reacher")
2. O site busca o livro na Open Library e extrai seus subjects
3. Questionário curto (3 perguntas)
4. Recomendações

### Caminho B: Só o questionário

1. Usuário clica em "Não sei, me ajude a descobrir"
2. Questionário completo (5 perguntas)
3. Recomendações

---

## Questionário

### Perguntas comuns (ambos os caminhos)

| # | Pergunta | Opções |
|---|---|---|
| 1 | Que clima você quer agora? | Ação e adrenalina / Mistério e investigação / Leve e divertido / Reflexivo e denso |
| 2 | O que te prende mais? | O protagonista / O plot e as reviravoltas / O mundo e a ambientação |
| 3 | Tamanho | Livro único / Série curta (2-4) / Saga longa |

### Perguntas extras (só Caminho B)

| # | Pergunta | Opções |
|---|---|---|
| 4 | Ritmo | Rápido — não consigo parar / Pausado — gosto de profundidade |
| 5 | Época/Mundo | Mundo real contemporâneo / Histórico / Fantasia ou ficção científica |

---

## Lógica de recomendação

### Com livro de referência

1. Buscar o livro na Open Library → extrair subjects
2. Filtrar subjects pelo tipo: pegar os 2-3 mais específicos e distintivos (ignorar "Fiction", "General", etc.)
3. Cruzar com subjects do questionário (tabela abaixo)
4. Aplicar filtro de páginas baseado no ritmo e tamanho escolhidos
5. Buscar na Open Library com `language=por`

### Sem livro de referência

1. Mapear respostas diretamente para subjects (tabela abaixo)
2. Aplicar filtros de páginas
3. Buscar na Open Library com `language=por`

---

## Mapeamento: respostas → subjects Open Library

| Resposta | Subjects para busca |
|---|---|
| Ação e adrenalina | `"Action & Adventure"` + `thriller` |
| Mistério e investigação | `"Detective and mystery stories"` + `thriller` |
| Leve e divertido | `"coming-of-age"` ou `"humor"` + `fiction` |
| Reflexivo e denso | `"psychological fiction"` + `"literary fiction"` |
| Protagonista forte | usar subjects do livro de referência + `"adventure fiction"` |
| Plot e reviravoltas | `"suspense fiction"` + `thriller` |
| Mundo e ambientação | `fantasy` ou `"science fiction"` |
| Livro único | filtro: páginas < 500 |
| Série curta | sem filtro de páginas, busca `series` nos subjects |
| Saga longa | sem filtro de páginas |
| Ritmo rápido | filtro: páginas ≤ 400 |
| Ritmo pausado | sem filtro |
| Mundo real | excluir fantasy/sci-fi dos subjects |
| Histórico | `"historical fiction"` |
| Fantasia/Sci-fi | `fantasy` ou `"science fiction"` |

---

## Subjects a ignorar (muito genéricos)

```
Fiction, General, Literature, American literature, English literature,
Large type books, New York Times bestseller, nyt:*
```

---

## Homepage: `/`

O fluxo de recomendação passa a ser a homepage. Para manter a indexação pelo Google, a página usa a seguinte separação:

- **`page.tsx` — server component** (indexável): contém o hero com título, descrição e links de categoria. O Google lê esse conteúdo.
- **`QuestionnaireClient` — client component**: o questionário interativo roda dentro da página, invisível ao Google mas funcional para o usuário.

```
/ (server component — indexável pelo Google)
  ├── Hero: título + descrição do site     ← Google indexa
  ├── QuestionnaireClient ('use client')   ← Google ignora, usuário usa
  └── Links para categorias principais     ← Google indexa
```

### Estrutura de componentes

```
src/components/discover/
  ├── QuestionnaireClient.tsx  → wrapper 'use client', gerencia estado
  ├── StepBookSearch.tsx       → busca o livro de referência (opcional)
  ├── StepQuestionnaire.tsx    → perguntas adaptadas ao caminho
  ├── StepLoading.tsx          → "Buscando livros para você..."
  └── StepResults.tsx          → BookGrid com os resultados
```

### Estado do questionário (dentro do QuestionnaireClient)

```ts
type QuestionnaireState =
  | 'book-search'      // passo 1: buscar livro de referência
  | 'questionnaire'    // passo 2: questionário
  | 'loading'          // buscando
  | 'results'          // mostrando resultados
```

---

## API: `/api/recommend`

### Request

```ts
GET /api/recommend?
  refBook=OL52955W        // work key do livro de referência (opcional)
  mood=action             // ação | misterio | leve | reflexivo
  focus=protagonist       // protagonista | plot | mundo
  size=standalone         // standalone | serie-curta | saga
  pace=fast               // fast | slow (opcional, só caminho B)
  world=real              // real | historico | fantasia (opcional, só caminho B)
```

### Lógica interna

```
1. Se refBook → buscar subjects do livro na Open Library
2. Mapear respostas para subjects
3. Combinar subjects (referência + questionário), remover genéricos
4. Montar query: subject:X + subject:Y + language=por
5. Aplicar filtro de páginas
6. Retornar até 12 livros com edição PT confirmada
```

---

## Mudanças na Open Library lib

Adicionar função `getWorkSubjects(olKey)` em `src/lib/open-library.ts`:

```ts
// Busca subjects de uma obra e filtra os genéricos
export async function getWorkSubjects(olKey: string): Promise<string[]>
```

---

## Arquivos a criar/modificar

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/page.tsx` | Modificar | Server component — hero + `<QuestionnaireClient>` + links de categoria |
| `src/components/discover/QuestionnaireClient.tsx` | Criar | Client component — gerencia estado do fluxo |
| `src/components/discover/StepBookSearch.tsx` | Criar | Passo 1: busca do livro de referência |
| `src/components/discover/StepQuestionnaire.tsx` | Criar | Passo 2: questionário adaptativo |
| `src/components/discover/StepLoading.tsx` | Criar | Estado de carregamento |
| `src/components/discover/StepResults.tsx` | Criar | Exibe recomendações |
| `src/app/api/recommend/route.ts` | Criar | Lógica de recomendação |
| `src/lib/recommend.ts` | Criar | Mapeamento respostas → subjects, montagem de query |
| `src/lib/open-library.ts` | Modificar | Adicionar `getWorkSubjects()` |

---

## O que NÃO está no escopo desta versão

- Lista curada de livros (avaliar depois se as queries forem imprecisas)
- Filtro de série vs livro único por metadado (Open Library não tem esse campo confiável — usar filtro de páginas como proxy)
- Salvar preferências do usuário
- Analytics de qual combinação gera melhores resultados

---

## Critério de sucesso

Para cada combinação de respostas, a busca deve retornar pelo menos 6 livros com edição portuguesa confirmada (ISBN PT/BR presente), sem livros claramente fora do perfil pedido.
