<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1OnvH4qfgZxeE3RF-MVQ-xZORlsACBPXj

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

4. Configure também as variáveis da Vercel para persistência dos JSONs:
   - `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
   - `GROQ_API_KEY` (API de insights)

## Persistência de empresas (Vercel Blob)

O editor agora permite:
- **Salvar** o JSON de uma empresa no Blob.
- **Importar** o último JSON salvo de uma empresa.
- Manter um envelope versionado (`schemaVersion`) para facilitar evolução do formato no futuro.
