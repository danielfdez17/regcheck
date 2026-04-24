# 06 Live dashboard and report export

## Integration summary

The GDPR playground now updates the output panel immediately as the user changes checkboxes and profile inputs, without waiting for backend persistence.

The same live state is used to export a structured report in HTML format, ready to print to PDF.

## Live preview behavior

- The dashboard derives a local `liveAssessment` object from frontend state.
- Rule selection, department toggles, and operational checkboxes update summary metrics in real time.
- Checklist rows are rendered from available local data so the user gets instant visual feedback.
- Backend persistence remains available only when the user explicitly saves the assessment.

## Report export behavior

- Added a report builder utility that creates a full HTML document from:
  - Current selector payload
  - Current live assessment payload
  - Recent local history entries
- Added an export action in the playground panel.
- The file is downloaded as `regcheck-report-<assessment_id>.html`.
- The exported document includes sections aligned with the project brief:
  1. Portada y contexto
  2. Indice
  3. Resumen ejecutivo
  4. Catalogo y recomendacion
  5. Problema y justificacion
  6. Arquitectura tecnica
  7. Proceso con evidencias
  8. Guia de despliegue
  9. Manual de uso
  10. Checklist generado
  11. Historial y roadmap

## Validation

- Run `make typecheck`
- Run `make lint`
- Run `make build`

## Notes

- Reactive rendering improves UX because the dashboard no longer depends on network latency for basic interaction.
- Persistence logic is preserved for traceability and historical snapshots.

## Back links

- [[00-index]]
- [[05-frontend-backend-integration]]
