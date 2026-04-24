import type {
  AssessmentHistoryItem,
  GDPRAssessmentResponse,
  GDPRRuleSelectorResponse,
} from "./regcheck-api";

type ReportContext = {
  selector: GDPRRuleSelectorResponse;
  assessment: GDPRAssessmentResponse;
  history: AssessmentHistoryItem[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}

function joinOrFallback(values: string[], fallback: string): string {
  return values.length > 0 ? values.join(", ") : fallback;
}

function renderTableRow(label: string, value: string): string {
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
}

function renderMetaCard(label: string, value: string): string {
  return `
    <div class="meta-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>`;
}

function renderChecklistRows(assessment: GDPRAssessmentResponse): string {
  return assessment.checklist_items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(item.priority)}</td>
          <td>${escapeHtml(item.concrete_action ?? "")}</td>
          <td>${escapeHtml(item.evidence_request ?? "")}</td>
        </tr>`,
    )
    .join("\n");
}

function renderHistoryRows(history: AssessmentHistoryItem[]): string {
  if (history.length === 0) {
    return `<tr><td colspan="4">No previous assessments have been stored yet.</td></tr>`;
  }

  return history
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(formatDateTime(item.created_at))}</td>
          <td>${escapeHtml(item.company_type)}</td>
          <td>${escapeHtml(item.service_description || "N/A")}</td>
          <td>${item.total_items} (${item.high_priority_items} high)</td>
        </tr>`,
    )
    .join("\n");
}

export function buildAssessmentReportHtml({
  selector,
  assessment,
  history,
}: ReportContext): string {
  const companyProfile = assessment.request.company_profile;
  const historyCount = history.length;
  const selectedRules = assessment.selected_rules.map((rule) => rule.label);
  const recommendedRules = assessment.recommended_rule_ids;
  const selectorCompanyTypes =
    selector.profile_options.company_types.join(", ");
  const selectorDepartments =
    selector.profile_options.department_types.join(", ");
  const selectorFrameworks =
    selector.profile_options.framework_options.join(", ");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>RegCheck Report</title>
    <style>
      :root {
        --bg: #0b1420;
        --panel: #101c2a;
        --panel-soft: #162534;
        --text: #eef4f8;
        --muted: #a8b7c7;
        --accent: #73e2c7;
        --border: rgba(168, 192, 214, 0.16);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        font-family: Inter, "Segoe UI", sans-serif;
        color: var(--text);
        background: linear-gradient(160deg, #07111b, #0d1a27 58%, #102133);
      }
      .page {
        width: min(1120px, calc(100vw - 32px));
        margin: 24px auto;
        background: rgba(9, 17, 26, 0.84);
        border: 1px solid var(--border);
        border-radius: 24px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
        overflow: hidden;
      }
      header {
        padding: 40px;
        background: linear-gradient(135deg, rgba(115, 226, 199, 0.14), rgba(126, 166, 255, 0.16));
        border-bottom: 1px solid var(--border);
      }
      h1, h2, h3, p { margin: 0; }
      h1 {
        font-size: clamp(2.2rem, 5vw, 4.4rem);
        line-height: 1;
        margin-bottom: 12px;
      }
      .subtitle { color: var(--muted); max-width: 70ch; line-height: 1.6; }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-top: 24px;
      }
      .meta-card, section {
        background: var(--panel);
        border: 1px solid var(--border);
      }
      .meta-card {
        padding: 14px 16px;
        border-radius: 16px;
      }
      .meta-card span, .eyebrow, .small { color: var(--muted); }
      .content { padding: 32px 40px 40px; display: grid; gap: 24px; }
      section {
        border-radius: 20px;
        padding: 24px;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.78rem;
        font-weight: 700;
        margin-bottom: 10px;
      }
      .section-title { font-size: 1.4rem; margin-bottom: 10px; }
      .copy { color: var(--muted); line-height: 1.75; }
      .grid-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .grid-three { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
      .panel {
        background: var(--panel-soft);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
      }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td {
        border-bottom: 1px solid var(--border);
        padding: 10px 12px;
        vertical-align: top;
        text-align: left;
        line-height: 1.55;
      }
      th { width: 24%; color: var(--muted); font-weight: 600; }
      ul { margin: 12px 0 0 20px; color: var(--text); }
      li { margin-bottom: 8px; }
      .roadmap li { margin-bottom: 12px; }
      .footer-note {
        color: var(--muted);
        font-size: 0.92rem;
        margin-top: 8px;
      }
      @media print {
        body { background: #fff; color: #000; }
        .page { width: 100%; margin: 0; border: 0; border-radius: 0; box-shadow: none; background: #fff; }
        header, section, .meta-card, .panel { background: #fff; }
      }
      @media (max-width: 900px) {
        .meta-grid, .grid-two, .grid-three { grid-template-columns: 1fr 1fr; }
      }
      @media (max-width: 700px) {
        header, .content { padding: 20px; }
        .meta-grid, .grid-two, .grid-three { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header>
        <p class="eyebrow">RegCheck Compliance Report</p>
        <h1>Informe exportable de cumplimiento</h1>
        <p class="subtitle">
          Informe generado a partir de una evaluación persistida en SQLite y alineado con el alcance de
          la primera entrega: reglas aplicables, checklist priorizado, evidencias requeridas y roadmap de
          evolución para la siguiente práctica.
        </p>
        <div class="meta-grid">
          ${renderMetaCard("Proyecto", "RegCheck")}
          ${renderMetaCard("Fecha", formatDateTime(assessment.created_at))}
          ${renderMetaCard("Dominio", assessment.domain_mode.label)}
          ${renderMetaCard("Evaluaciones guardadas", String(historyCount))}
        </div>
      </header>

      <div class="content">
        <section>
          <div class="eyebrow">1. Portada y contexto</div>
          <h2 class="section-title">Resumen de la evaluación actual</h2>
          <p class="copy">
            Empresa tipo ${escapeHtml(companyProfile?.company_type ?? "other")}, departamento(s)
            ${escapeHtml(joinOrFallback(companyProfile?.department_types ?? [], "sin departamentos declarados"))},
            servicio analizado ${escapeHtml(companyProfile?.service_description || "sin descripción de servicio")}
            y reglas solicitadas ${escapeHtml(joinOrFallback(companyProfile?.requested_frameworks ?? [], "GDPR"))}.
          </p>
          <table>
            <tbody>
              ${renderTableRow("Reglas seleccionadas", selectedRules.length > 0 ? selectedRules.join("; ") : "Ninguna")}
              ${renderTableRow("Reglas recomendadas", recommendedRules.length > 0 ? recommendedRules.join("; ") : "Ninguna")}
              ${renderTableRow("Checklist total", String(assessment.summary.total_items))}
              ${renderTableRow("Prioridad alta", String(assessment.summary.high_priority_items))}
              ${renderTableRow("Prioridad media", String(assessment.summary.medium_priority_items))}
              ${renderTableRow("Prioridad baja", String(assessment.summary.low_priority_items))}
            </tbody>
          </table>
        </section>

        <section>
          <div class="eyebrow">2. Índice</div>
          <div class="grid-two">
            <div class="panel">
              <h3>Contenido del informe</h3>
              <ul>
                <li>Portada y contexto</li>
                <li>Resumen ejecutivo</li>
                <li>Descripción del problema y justificación</li>
                <li>Arquitectura técnica</li>
                <li>Proceso de desarrollo con evidencias</li>
                <li>Guía de despliegue</li>
                <li>Manual de uso</li>
                <li>Conclusiones y roadmap</li>
              </ul>
            </div>
            <div class="panel">
              <h3>Sección destacada</h3>
              <p class="copy">
                El informe prioriza el checklist generado, la evidencia solicitada por cada control y el
                estado de persistencia real para que el documento sea útil como anexo de entrega y como
                base de iteración para la práctica siguiente.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div class="eyebrow">3. Resumen ejecutivo</div>
          <p class="copy">
            RegCheck transforma el contexto operativo de una empresa en un conjunto de controles y tareas
            de cumplimiento priorizadas. La evaluación actual incluye ${assessment.summary.total_items} acciones
            concretas, de las cuales ${assessment.summary.high_priority_items} requieren atención inmediata.
            Cada control incluye una acción recomendada y una petición de evidencia para convertir el
            checklist en un repositorio de auditoría reutilizable.
          </p>
        </section>

        <section>
          <div class="eyebrow">4. Catálogo y recomendación</div>
          <table>
            <tbody>
              ${renderTableRow("Dominio selector", selector.domain_mode.label)}
              ${renderTableRow("Reglas disponibles", String(selector.available_rules.length))}
              ${renderTableRow("Tipos de empresa", selectorCompanyTypes || "N/A")}
              ${renderTableRow("Departamentos", selectorDepartments || "N/A")}
              ${renderTableRow("Frameworks", selectorFrameworks || "N/A")}
            </tbody>
          </table>
          <p class="copy" style="margin-top: 12px;">
            La recomendación se calcula a partir de la descripción del servicio, los departamentos
            seleccionados y los controles operativos activos en la ficha de empresa.
          </p>
        </section>

        <section>
          <div class="eyebrow">5. Descripción del problema y justificación</div>
          <div class="grid-two">
            <div class="panel">
              <h3>Problema</h3>
              <p class="copy">
                El equipo necesita una forma rápida de traducir tipos de compañía, departamentos y servicios
                en controles de cumplimiento comprensibles y accionables.
              </p>
            </div>
            <div class="panel">
              <h3>Solución</h3>
              <p class="copy">
                El sistema combina selector de reglas, recomendación por contexto, checklist persistido y
                exportación del informe para que el resultado sea trazable y entregable.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div class="eyebrow">6. Arquitectura técnica</div>
          <div class="grid-three">
            <div class="panel">
              <h3>Frontend</h3>
              <p class="copy">React + Vite + TypeScript con panel de auditoría, selector y exportación.</p>
            </div>
            <div class="panel">
              <h3>Backend</h3>
              <p class="copy">FastAPI expone selector, checklist, evaluación persistida y histórico.</p>
            </div>
            <div class="panel">
              <h3>Persistencia</h3>
              <p class="copy">SQLite guarda catálogo GDPR, checklist y snapshots de evaluación.</p>
            </div>
          </div>
        </section>

        <section>
          <div class="eyebrow">7. Proceso de desarrollo con evidencias</div>
          <table>
            <tbody>
              ${renderTableRow("Modelo inicial", "Catálogo GDPR seedado en SQLite y primer checklist funcional")}
              ${renderTableRow("Persistencia real", "Evaluaciones almacenadas como snapshots con historial consultable")}
              ${renderTableRow("Interfaz", "Dashboard con métricas, checklist priorizado y contexto de empresa")}
              ${renderTableRow("Evidencia", `Última evaluación registrada: ${formatDateTime(assessment.created_at)}`)}
            </tbody>
          </table>
        </section>

        <section>
          <div class="eyebrow">8. Guía de despliegue</div>
          <ul>
            <li><strong>Instalar dependencias:</strong> <span class="small">make install</span></li>
            <li><strong>Levantar stack local:</strong> <span class="small">make dev-docker</span></li>
            <li><strong>Validar calidad:</strong> <span class="small">make build && make typecheck && make lint && make pylint</span></li>
            <li><strong>Generar PDF:</strong> abrir este HTML y usar la opción de imprimir del navegador.</li>
          </ul>
        </section>

        <section>
          <div class="eyebrow">9. Manual de uso</div>
          <div class="grid-two">
            <div class="panel">
              <h3>Paso 1</h3>
              <p class="copy">Rellenar tipo de compañía, departamentos y descripción del servicio.</p>
            </div>
            <div class="panel">
              <h3>Paso 2</h3>
              <p class="copy">Seleccionar o ajustar reglas y generar la evaluación.</p>
            </div>
          </div>
        </section>

        <section>
          <div class="eyebrow">10. Checklist generado</div>
          <table>
            <thead>
              <tr>
                <th>Control</th>
                <th>Prioridad</th>
                <th>Acción concreta</th>
                <th>Evidencia requerida</th>
              </tr>
            </thead>
            <tbody>
              ${renderChecklistRows(assessment)}
            </tbody>
          </table>
        </section>

        <section>
          <div class="eyebrow">11. Historial y roadmap</div>
          <div class="grid-two">
            <div class="panel">
              <h3>Historial reciente</h3>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Empresa</th>
                    <th>Servicio</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  ${renderHistoryRows(history)}
                </tbody>
              </table>
            </div>
            <div class="panel roadmap">
              <h3>Road map de mejora</h3>
              <ul>
                <li>Exportación directa a PDF con formato corporativo.</li>
                <li>Repositorio de evidencias por control con adjuntos.</li>
                <li>Soporte para múltiples marcos regulatorios además de GDPR.</li>
                <li>Filtros y búsqueda en el historial de evaluaciones.</li>
                <li>Autenticación de usuarios y trazabilidad de cambios.</li>
              </ul>
            </div>
          </div>
          <p class="footer-note">
            Informe generado por RegCheck a partir de los datos persistidos en la última evaluación.
          </p>
        </section>
      </div>
    </div>
  </body>
</html>`;
}
