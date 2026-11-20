# Axioma-X — Plataforma de Cotizaciones y Gestión Comercial

Proyecto desarrollado para **Dojo AI Hackathon (Track 02: Build for Business)**.

## Qué resuelve
**Axioma-X** permite a empresas y profesionales convertir solicitudes informales (WhatsApp, dictado por voz o imagen) en **cotizaciones formales en PDF** en segundos, con catálogo de precios editable, enlaces de aprobación para clientes, exportación a CSV y respaldo completo de datos.

### Funcionalidades
- **Cotizador rápido:** Procesa texto libre, dictado por voz (Web Speech API) o foto de referencia, o arma cotizaciones manualmente desde tu catálogo.
- **PDF profesional con logotipo:** Genera documentos PDF listos para enviar con logo personalizado, desglose, descuentos, impuestos y condiciones.
- **Link compartible (`/q?d=...`):** Genera un enlace directo para que el cliente vea su cotización, descargue el PDF y confirme aprobación o solicite cambios.
- **Historial y exportación CSV:** Filtra por estado, edita cotizaciones guardadas y exporta reportes a Excel/CSV.
- **Catálogo y respaldos JSON:** Administra servicios/precios y exporta o restaura toda tu base en JSON.
- **Integración opcional con LLM (`GEMINI_API_KEY` / `OPENAI_API_KEY`):** Si configuras una clave en `.env.local`, usa el modelo para extracción avanzada; si no, opera de forma determinística sin fricción.

## Instalación y Uso Local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.
