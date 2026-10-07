## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Run the app: `npm run dev`
3. Type-check: `npm run typecheck`

Configure as variáveis da Vercel para persistência e insights:
- `REPORTBLOB_READ_WRITE_TOKEN` (Vercel Blob)
- `GROQ_API_KEY` (API de insights)

## Estrutura

- `src/lib/calculations.ts`: todas as regras contábeis (totais, PL automático, valor de mercado, linhas exibidas).
- `src/lib/i18n.ts`: textos do relatório em PT/EN.
- `src/lib/fields.ts`: campos do editor por seção.
- `src/components/editor/`: editor (seções, campos numéricos, participações, IA, checagem do balanço).
- `src/components/report/`: relatório A4 (capa, índice, relatório do contador, balanço, DRE, insights).
- `api/`: funções serverless da Vercel (persistência no Blob e insights via Groq).

## Persistência de empresas (Vercel Blob)

O editor permite:
- **Salvar** o JSON de uma empresa no Blob.
- **Importar** o último JSON salvo de uma empresa.
- Manter um envelope versionado (`schemaVersion`) para facilitar evolução do formato no futuro.

O rascunho em edição também fica salvo automaticamente no navegador.
