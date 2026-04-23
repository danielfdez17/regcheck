# Desarrollo de Herramienta de Ciberseguridad con IA

## 1. Descripción de la práctica

Esta práctica consiste en el diseño, desarrollo y despliegue de una **herramienta de**
**ciberseguridad real** haciendo uso de plataformas y asistentes de Inteligencia Artificial como
apoyo al desarrollo. El objetivo es demostrar la capacidad de construir soluciones
funcionales y profesionales combinando conocimientos de seguridad informática con las
herramientas de desarrollo asistido por IA disponibles actualmente.


Los grupos podrán elegir libremente entre las tres líneas de trabajo definidas en esta
práctica: **Blue Team**, **Red Team** o **Normativa y Cumplimiento**. La herramienta resultante
debe ser funcional, estar desplegada en un servidor real y contar con una documentación
profesional que evidencie todo el proceso de desarrollo.

---
## 2. Composición de los grupos

| Tamaño del grupo | Considereaciones                                                                      |
| ---------------- | ------------------------------------------------------------------------------------- |
| 1 persona        | Proyecto de alcance reducido                                                          |
| 2 - 3 personas   | Proyecto de alcance medio. Se esperan funcionalidades diferenciadas por miembro.      |
| 4 - 5 personas   | Proyecto de alcance completo. Se exige mayor complejidad, modularidad y documentación |

---

## 3. Herramientas de IA para el Desarrollo

Los grupos podrán utilizar cualquiera de las siguientes plataformas y asistentes de IA para
el desarrollo de su herramienta. No es obligatorio limitarse a una sola; se recomienda
combinarlas según la fase del proyecto:


| Plataformas No Code / Low-Code                                                                      | IDEs y Asistentes de Código                                                                                           | IAs Generativas y Agentes                                                                                                                           | Infraestructura y Despliegue IA                                                                                                                           |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - Lovable<br>- Emergent<br>- Bolt.new<br>- v0 by Vercel<br>- Replit AI<br>- Webflow AI<br>- Dify.ai | - Calude Code<br>- Cursor<br>- GitHub Copilot<br>- Windsurf (Codeium)<br>- Aider<br>- Amazon Q Developer<br>- Tabnine | - ChatGPT / GPT-4o<br>- Claude (Anthropic)<br>- Gemini / Gemini CLI<br>- Mistral Le Chat<br>- Perplexity AI<br>- DeepSeek Coder<br>- Qwen (Alibaba) | - Hugging Face Spaces<br>- Ollama (local LLMs)<br>- LangChain / LangGraph<br>- CrewAI<br>- AutoGPT / AutoGen<br>- n8n with AI nodes<br>- Make / Zapier AI |
Cada grupo deberá elegir una de las tres líneas de trabajo y definir una herramienta concreta dentro de ella. A continuación, se presentan ejemplos orientativos para inspirarel desarrollo:

### 4.1 Blue Team --- Defensa y Monitorización

Herramientas orientadas a la detección de amenazas, monitorización de sistemas, análisis
de logs y respuesta a incidentes.


|  #  |                    Herramienta                    |                                                                            Descripción                                                                            |
| :-: | :-----------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| 01  |             Analizador de logs con IA             | Panel web que ingesta logs de sistemas (auth,<br>nginx, syslog) y usa LLM para detectar patrones<br>anómalos y generar alertas explicadas en lenguaje<br>natural. |
| 02  |   Sistema de detección de intrusos (IDS) con ML   |        Dashboard que analiza tráfico de red en tiempo real, clasifica comportamientos sospechosos con modelos de<br>ML y visualiza los ataques detectados.        |
| 03  |           Analizador de malware con IA            |       Herramienta que recibe ficheros sospechosos, los<br>analiza con sandboxing e IA generativa, y genera un informe de comportamiento y nivel de riesgo.        |
| 04  |    Monitor de vulnerabilidades en dependencias    |                      Escanea repositorios de código, identifica librerías con CVEs conocidos y usa IA para priorizar y sugerir mitigaciones.                      |
| 05  |  Correlador de eventos de seguridad (mini-SIEM)   |           Agrega eventos de múltiples fuentes, los correlaciona con reglas e IA y presenta un dashboard de incidentes con severidad y recomendaciones.            |
| 06  |   Honeypot inteligente con análisis automático    |              Despliega servicios falsos, captura intentos de acceso y usa IA para clasificar al atacante y generar un perfil del vector de amenaza.               |
| 07  |      Generador de reglas SIEM / SIGMA con IA      |           A partir de descripciones en lenguaje natural, genera reglas SIGMA, Snort o Suricata listas para usar, con un panel de gestión y exportación.           |
| 08  |       Analizador de phising en tiempo real        |         Extensión web o panel que evalúa URLs, emails o capturas de pantalla con IA y determina si son intentos de phishing, con justificación detallada.         |
| 09  | Gestor de respuesta a incidentes asistido por IA  |          Plataforma que guía al analista en el proceso IR, sugiere pasos de contención y erradicación, y genera el informe de incidente automáticamente.          |
| 10  |        Monitor de dark web y filtraciones         |             Rastrea fuentes OSINT y dark web en busca de menciones de activos de la organización, alertando y generando un resumen ejecutivo con IA.              |
| 11  | Analizador de configuraciones seguras (hardening) |                   Recibe configuraciones de sistemas (SSH, nginx, firewall) y evalúa con IA su nivel de seguridad frente a benchmarks CIS/STIG.                   |
| 12  | Detector de amenazas en imágenes de contenedores  |       Escanea imágenes Docker con IA, identifica configuraciones inseguras, secretos expuestos y software vulnerable, mostrando resultados en un dashboard.       |
| 13  |    Sistema de threat intelligence automatizado    |         Agrega feeds de IOCs (IPs, hashes, dominios), los enriquece con contexto usando IA y presenta un panel de amenazas activas para la organización.          |
| 14  |     Herramienta de análisis forense asistida      |        Analiza artefactos forenses (dumps de memoria, ficheros, registros) con IA y genera una línea temporal del incidente con hipótesis de lo ocurrido.         |
| 15  |     Monitor de exposición de activos externos     |   Descubre activos<br>expuestos en internet (subdominios, puertos, certificados) y usa IA para puntuar el riesgo y generar un informe de superficie de ataque.    |

### 4.2 Red Team --- Ataque y Pentesting

Herramientas orientadas a pruebas de penetración, análisis de vulnerabilidades,
simulación de ataques y auditoría ofensiva. Todas las herramientas deben usarse
exclusivamente en entornos controlados y con autorización expresa.


|  #  |                    Herramienta                    |                                                                            Descripción                                                                             |
| :-: | :-----------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| 01  |          Asistente de pentesting con IA           |          Panel que guía al pentester paso a paso, sugiere vectores de ataque basándose en la topología de red y genera el informe final automáticamente.           |
| 02  |      Generador de payloads ofuscados con LLM      |           Herramienta que genera variantes de payloads para pruebas de evasión, explica cada técnica de ofuscación y puntúa la probabilidad de evasión.            |
| 03  |      Escáner de vulnerabilidades web con IA       |       Analiza aplicaciones web en busca de OWASP Top 10, categoriza los hallazgos y usa IA para generar PoC de explotación y recomendaciones de remediación.       |
| 04  |   Analizador de superficie de ataque con OSINT    |             Recopila información pública sobre un objetivo (dominios, empleados, tecnologías), construye un mapa de ataque y prioriza vectores con IA.             |
| 05  |    Generador de campañas de phishing simulado     |                     Crea emails de phishing realistas para simulacros de concienciación, analiza quién cae y genera reportes de riesgo humano.                     |
| 06  |           Auditor de contraseñas con IA           | Analiza políticas de contraseñas, hashea y prueba listas personalizadas con IA para generar candidatas y reporta el nivel de resistencia a ataques de diccionario. |
| 07  | Herramienta de reconocimiento activo automatizado |        Automatiza fases de reconocimiento (Nmap, whois, DNS, fingerprinting) y usa IA para correlacionar resultados y sugerir el siguiente paso del ataque.        |
| 08  | Analizador de código fuente para vulnerabilidades |         Realiza SAST sobre repositorios con IA, detecta patrones inseguros (SQL injection, XSS, SSRF) y genera un informe priorizando por explotabilidad.          |
| 09  |     Simulador de ataques de ingeniería social     |                Plataforma para simular llamadas de vishing o pretexting, con guiones generados por IA y análisis de la efectividad de cada vector.                 |
| 10  |      Generador de informes de pentest con IA      |            Recibe los hallazgos en bruto del pentester y genera automáticamente el informe ejecutivo y técnico con CVSSv3, evidencias y remediaciones.             |
| 11  |          Fuzzer inteligente de APIs REST          |       Prueba endpoints de APIs con entradas malformadas generadas por IA, detecta comportamientos inesperados y categoriza las vulnerabilidades encontradas.       |
| 12  |    Herramienta de análisis de binarios con IA     |           Analiza ejecutables o firmware con IA para identificar funciones sospechosas, hardcoded secrets y posibles vulnerabilidades sin código fuente.           |
| 13  |        Red Team Automation con agentes IA         |                Orquesta un flujo completo de red teaming (recon → explotación → post-explotación) usando agentes autónomos con LangChain o CrewAI.                 |
| 14  |   Analizador de configuraciones cloud inseguras   |        Audita configuraciones de AWS/Azure/GCP buscando misconfigurations comunes (S3 públicos, IAM permisivo) y genera un plan de remediación priorizado.         |
| 15  |    Herramienta de análisis de tráfico cifrado     |    Analiza metadatos de tráfico TLS/SSL para identificar comportamientos anómalos sin descifrar el contenido, usando IA para clasificar el tráfico sospechoso.     |

### 4.3 Normativa y Cumplimiento

Herramientas orientadas a la gestión del cumplimiento normativo, análisis de riesgos,
privacidad y gobierno de la seguridad. Incluyen marcos como ISO 27001, ENS, GDPR,
NIS2 o NIST.

|  #  |                     Herramienta                      |                                                                            Descripción                                                                            |
| :-: | :--------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| 01  |      Asistente de cumplimiento ISO 27001 con IA      |       Panel interactivo que evalúa el nivel de cumplimiento de una organización frente a los controles de ISO 27001, con recomendaciones generadas por IA.        |
| 02  |          Analizador de brechas de GDPR/LOPD          |         Analiza políticas de privacidad, contratos y procesos de datos con IA para identificar incumplimientos del RGPD y generar un plan de adecuación.          |
| 03  |        Gestor de riesgos de seguridad con IA         |          Herramienta de análisis y gestión de riesgos (metodología MAGERIT o similar) que usa IA para sugerir activos, amenazas y controles mitigadores.          |
| 04  |    Chatbot experto en normativa de ciberseguridad    |             Asistente conversacional entrenado sobre ENS, NIS2, GDPR, ISO 27001 y NIST que responde preguntas y genera documentacion de cumplimiento.             |
| 05  |      Generador de políticas de seguridad con IA      |      Genera automáticamente políticas de seguridad (contraseñas, acceso, BYOD, teletrabajo) adaptadas al perfil de la organización y la normativa aplicable.      |
| 06  |            Dashboard de cumplimiento ENS             |            Panel visual del estado de cumplimiento frente al Esquema Nacional de Seguridad, con seguimiento de controles, evidencias y plan de mejora.            |
| 07  |              Analizador de DPIAs con IA              |   Asiste en la elaboración de Evaluaciones de Impacto de Privacidad (DPIA), identificando riesgos para los derechos de los interesados y medidas de mitigación.   |
| 08  |   Gestor de incidentes de seguridad y notificación   |      Gestiona el ciclo de vida de incidentes de seguridad conforme al RGPD (72h), genera las notificaciones a la AEPD y el informe interno automáticamente.       |
| 09  |       Auditor de contratos con terceros (DPA)        |           Analiza contratos de encargados de tratamiento con IA, detecta cláusulas que incumplen el RGPD y sugiere el texto correcto para cada sección.           |
| 10  |   Herramienta de clasificación de datos sensibles    | Escanea repositorios, bases de datos y documentos para clasificar información según su nivel de sensibilidad y generar el registro de actividades de tratamiento. |
| 11  |       Simulador de auditoría de ciberseguridad       |         Genera cuestionarios de auditoría adaptados al sector y tamaño de la organización, evalúa las respuestas con IA y produce un informe de madurez.          |
| 12  |     Monitor de cambios normativos con alertas IA     |             Rastrea el BOE, DOUE y organismos reguladores en busca de novedades legales relevantes, las resume con IA y envía alertas personalizadas.             |
| 13  |    Generador de planes de continuidad de negocio     |         Asiste en la elaboración del BCP/DRP, evalúa RPO/RTO, sugiere estrategias de recuperación y genera la documentación completa lista para auditar.          |
| 14  | Analizador de seguridad de proveedores (third-party) |               Evalúa el nivel de seguridad de proveedores mediante cuestionarios y escaneo de su postura externa, generando un scorecard de riesgo.               |
| 15  | Herramienta de concienciación y formación adaptativa |      Plataforma de formación en ciberseguridad que adapta el contenido al perfil del empleado con IA, mide la eficacia y reporta el nivel de madurez humana.      |

---

## 5. Obligatorios

### 01 - Panel Web con Dashboard

La herramienta debe disponer de una interfaz web funcional con un dashboard que
muestre la información relevante de forma visual. Se valorará positivamente que sea
accesible y usable desde internet, no solo en local.

### 02 - Control de versions con GitHub

Todo el código del proyecto debe estar alojado en un repositorio de GitHub público o
privado (accesible al profesor). Se evaluará el historial de commits, el uso de ramas, los
mensajes de commit y la organización del repositorio.

### 03 - Despliegue en servidor Hetzner

La aplicación debe estar desplegada y accesible en un servidor de Hetzner Cloud (VPS).
El grupo debe gestionar el aprovisionamiento del servidor, la configuración del entorno y
el despliegue de la aplicación. Se valorará el uso de contenedores (Docker) y el uso de
dominio propio o subdominio.

### 04 - Informe de documentación en PDF

El proyecto debe acompañarse de un informe profesional en formato PDF que
documente todo el proceso de desarrollo. El informe debe cuidar especialmente el estilo,
la maquetación y la presentación, e incluir evidencias (capturas de pantalla, diagramas,
fragmentos de código) de cada fase del proyecto.

El informe debe contener como mínimo:
1. Portada con nombre del proyecto, integrantes y fecha
2. Índice de contenidos
3. Resumen ejecutivo (máximo 1 página)
4. Descripción del problema y justificación de la solución
5. Arquitectura técnica con diagrama
6. Proceso de desarrollo con evidencias (fase a fase)
7. Guía de despliegue paso a paso
8. Manual de uso de la herramienta
9. Conclusiones y lecciones aprendidas
10. Road map de mejora (ver requisito 05)

### 05 - Road Map de mejora para la Práctica 2

La herramienta debe incluir un road map detallado con las mejoras planificadas para la
Práctica 2. Este road map debe presentarse de forma visual (diagrama de fases, tabla de
hitos o similar) e incluir al menos:
1. Nuevas funcionalidades planificadas (mínimo 5)
2. Mejoras de rendimiento o escalabilidad
3. Mejoras de seguridad de la propia herramienta
4. Integración con otras herramientas o APIs
5. Estimación de tiempo y recursos para cada mejora


---

## 6. Criterios de Evaluación


| Criterio                                                  | Peso | Puntos  |
| --------------------------------------------------------- | ---- | ------- |
| Funcionalidad y calidad técnica de la herramienta         | 30%  | 3 pts   |
| Dashboard web y usabilidad de la interfaz                 | 15%  | 1.5 pts |
| Despliegue correcto en Hetzner y accesibilidad            | 15%  | 1.5 pts |
| Calidad del repositorio de GitHub (commits, estructura)   | 10%  | 1 pt    |
| Calidad del informe PDF (estilo, evidencias, completitud) | 20%  | 2 pts   |
| Road map de mejora para la Práctica 2                     | 10%  | 1 pt    |

---

## 7. Entregables

Cada grupo debe entregar los siguientes elementos en la fecha indicada por el profesor:
- URL de la herramienta desplegada en Hetzner (accesible y funcional en el momento de la evaluación)
- URL del repositorio GitHub con todo el código y commits del desarrollo
- Informe de documentación en formato PDF (entregado en el campus virtual)
- Breve presentación oral de 10 minutos por grupo demostrando la herramienta en vivo