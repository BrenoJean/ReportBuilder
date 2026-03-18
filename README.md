# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

4. Configure também as variáveis da Vercel para persistência dos JSONs:
   - `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
   - `GROQ_API_KEY` (API de insights)

## Persistência de empresas (Vercel Blob)

O editor agora permite:
- **Salvar** o JSON de uma empresa no Blob.
- **Importar** o último JSON salvo de uma empresa.
- Manter um envelope versionado (`schemaVersion`) para facilitar evolução do formato no futuro.
