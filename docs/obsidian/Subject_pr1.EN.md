# Development of an AI-Powered Cybersecurity Tool

## 1. Practice Description

This practice consists of the design, development, and deployment of a **real cybersecurity tool** using Artificial Intelligence platforms and assistants to support development. The goal is to demonstrate the ability to build functional and professional solutions by combining cybersecurity knowledge with AI-assisted development tools currently available.

Groups may freely choose among the three work tracks defined in this practice: **Blue Team**, **Red Team**, or **Regulation and Compliance**. The resulting tool must be functional, deployed on a real server, and accompanied by professional documentation that demonstrates the full development process.

---

## 2. Group Composition

| Group size   | Considerations                                                                      |
| ------------ | ----------------------------------------------------------------------------------- |
| 1 person     | Reduced-scope project                                                               |
| 2 - 3 people | Medium-scope project. Differentiated functionalities per member are expected.       |
| 4 - 5 people | Full-scope project. Greater complexity, modularity, and documentation are required. |

---

## 3. AI Tools for Development

Groups may use any of the following AI platforms and assistants to develop their tool. It is not mandatory to limit yourselves to only one; combining them depending on the project phase is recommended:

| No-Code / Low-Code Platforms                                                                        | IDEs and Code Assistants                                                                                              | Generative AIs and Agents                                                                                                                           | AI Infrastructure and Deployment                                                                                                                          |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - Lovable<br>- Emergent<br>- Bolt.new<br>- v0 by Vercel<br>- Replit AI<br>- Webflow AI<br>- Dify.ai | - Claude Code<br>- Cursor<br>- GitHub Copilot<br>- Windsurf (Codeium)<br>- Aider<br>- Amazon Q Developer<br>- Tabnine | - ChatGPT / GPT-4o<br>- Claude (Anthropic)<br>- Gemini / Gemini CLI<br>- Mistral Le Chat<br>- Perplexity AI<br>- DeepSeek Coder<br>- Qwen (Alibaba) | - Hugging Face Spaces<br>- Ollama (local LLMs)<br>- LangChain / LangGraph<br>- CrewAI<br>- AutoGPT / AutoGen<br>- n8n with AI nodes<br>- Make / Zapier AI |

Each group must choose one of the three work tracks and define a specific tool within it. The following examples are provided as guidance and inspiration for development:

### 4.1 Blue Team --- Defense and Monitoring

Tools focused on threat detection, system monitoring, log analysis, and incident response.

|  #  |                     Tool                     |                                                                         Description                                                                          |
| :-: | :------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------: |
| 01  |           AI-powered log analyzer            | Web dashboard that ingests system logs (auth, nginx, syslog) and uses an LLM to detect anomalous patterns and generate alerts explained in natural language. |
| 02  |  ML-based Intrusion Detection System (IDS)   |            Dashboard that analyzes network traffic in real time, classifies suspicious behavior using ML models, and visualizes detected attacks.            |
| 03  |         AI-powered malware analyzer          |           Tool that receives suspicious files, analyzes them through sandboxing and generative AI, and produces a behavior and risk-level report.            |
| 04  |       Dependency vulnerability monitor       |                      Scans code repositories, identifies libraries with known CVEs, and uses AI to prioritize and suggest mitigations.                       |
| 05  |    Security event correlator (mini-SIEM)     |      Aggregates events from multiple sources, correlates them with rules and AI, and presents an incident dashboard with severity and recommendations.       |
| 06  | Intelligent honeypot with automated analysis |                 Deploys fake services, captures access attempts, and uses AI to classify the attacker and generate a threat-vector profile.                  |
| 07  |         AI SIEM/SIGMA rule generator         |               From natural language descriptions, generates ready-to-use SIGMA, Snort, or Suricata rules, with a management and export panel.                |
| 08  |         Real-time phishing analyzer          | Browser extension or panel that evaluates URLs, emails, or screenshots with AI to determine whether they are phishing attempts, with detailed justification. |
| 09  |    AI-assisted incident response manager     |      Platform that guides analysts through the IR process, suggests containment and eradication steps, and automatically generates the incident report.      |
| 10  |        Dark web and data leak monitor        |           Tracks OSINT and dark web sources for mentions of organizational assets, triggering alerts and generating an AI-based executive summary.           |
| 11  |  Secure configuration analyzer (hardening)   |                  Receives system configurations (SSH, nginx, firewall) and uses AI to assess security posture against CIS/STIG benchmarks.                   |
| 12  |       Container image threat detector        |       Scans Docker images with AI, identifies insecure configurations, exposed secrets, and vulnerable software, and displays results in a dashboard.        |
| 13  |     Automated threat intelligence system     |         Aggregates IOC feeds (IPs, hashes, domains), enriches them with context using AI, and presents a dashboard of active organizational threats.         |
| 14  |       Assisted forensic analysis tool        |           Analyzes forensic artifacts (memory dumps, files, logs) with AI and generates an incident timeline with hypotheses about what happened.            |
| 15  |       External asset exposure monitor        |         Discovers assets exposed on the internet (subdomains, ports, certificates) and uses AI to score risk and generate an attack-surface report.          |

### 4.2 Red Team --- Attack and Pentesting

Tools focused on penetration testing, vulnerability analysis, attack simulation, and offensive
auditing. All tools must be used exclusively in controlled environments and with explicit
authorization.

|  #  |                 Tool                  |                                                                    Description                                                                     |
| :-: | :-----------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------: |
| 01  |        AI pentesting assistant        | Dashboard that guides the pentester step by step, suggests attack vectors based on network topology, and automatically generates the final report. |
| 02  |   LLM obfuscated payload generator    |           Tool that generates payload variants for evasion testing, explains each obfuscation technique, and scores evasion probability.           |
| 03  |     AI web vulnerability scanner      |   Analyzes web applications for OWASP Top 10 issues, categorizes findings, and uses AI to generate exploit PoCs and remediation recommendations.   |
| 04  |     OSINT attack surface analyzer     |       Collects public information about a target (domains, employees, technologies), builds an attack map, and prioritizes vectors with AI.        |
| 05  | Simulated phishing campaign generator |            Creates realistic phishing emails for awareness simulations, analyzes who falls for them, and generates human-risk reports.             |
| 06  |          AI password auditor          |   Analyzes password policies, hashes, and custom list-based testing with AI-generated candidates, then reports resistance to dictionary attacks.   |
| 07  | Automated active reconnaissance tool  |       Automates reconnaissance phases (Nmap, whois, DNS, fingerprinting) and uses AI to correlate results and suggest the next attack step.        |
| 08  |  Source code vulnerability analyzer   | Performs SAST on repositories with AI, detects insecure patterns (SQL injection, XSS, SSRF), and generates a report prioritized by exploitability. |
| 09  |  Social engineering attack simulator  |            Platform for simulating vishing or pretexting calls, with AI-generated scripts and analysis of each vector's effectiveness.             |
| 10  |      AI pentest report generator      |        Receives raw pentester findings and automatically generates executive and technical reports with CVSSv3, evidence, and remediations.        |
| 11  |      Intelligent REST API fuzzer      |          Tests API endpoints with AI-generated malformed inputs, detects unexpected behavior, and categorizes discovered vulnerabilities.          |
| 12  |        AI binary analysis tool        |  Analyzes executables or firmware with AI to identify suspicious functions, hardcoded secrets, and potential vulnerabilities without source code.  |
| 13  |  Red Team automation with AI agents   |        Orchestrates a full red teaming flow (recon -> exploitation -> post-exploitation) using autonomous agents with LangChain or CrewAI.         |
| 14  | Insecure cloud configuration analyzer |     Audits AWS/Azure/GCP configurations for common misconfigurations (public S3, permissive IAM) and generates a prioritized remediation plan.     |
| 15  |    Encrypted traffic analysis tool    |       Analyzes TLS/SSL traffic metadata to identify anomalous behavior without decrypting content, using AI to classify suspicious traffic.        |

### 4.3 Regulation and Compliance

Tools focused on compliance management, risk analysis, privacy, and security governance. They include frameworks such as ISO 27001, ENS, GDPR, NIS2, or NIST.

|  #  |                    Tool                    |                                                                        Description                                                                         |
| :-: | :----------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------: |
| 01  | AI-powered ISO 27001 compliance assistant  |           Interactive dashboard that evaluates an organization's compliance level against ISO 27001 controls, with AI-generated recommendations.           |
| 02  |           GDPR/LOPD gap analyzer           |             Analyzes privacy policies, contracts, and data processes with AI to identify GDPR non-compliance and generate an adaptation plan.              |
| 03  |          AI security risk manager          |            Risk analysis and management tool (MAGERIT methodology or similar) that uses AI to suggest assets, threats, and mitigating controls.            |
| 04  |  Cybersecurity regulation expert chatbot   |          Conversational assistant trained on ENS, NIS2, GDPR, ISO 27001, and NIST that answers questions and generates compliance documentation.           |
| 05  |        AI security policy generator        |     Automatically generates security policies (passwords, access, BYOD, remote work) adapted to the organization's profile and applicable regulations.     |
| 06  |          ENS compliance dashboard          | Visual panel showing compliance status against the Spanish National Security Framework (ENS), including control tracking, evidence, and improvement plans. |
| 07  |              AI DPIA analyzer              |                Assists in preparing Privacy Impact Assessments (DPIA), identifying risks to data subjects' rights and mitigation measures.                 |
| 08  | Security incident and notification manager |                 Manages the incident lifecycle in line with GDPR (72h), automatically generating AEPD notifications and internal reports.                  |
| 09  |     Third-party contract (DPA) auditor     |          Analyzes data processing agreements with AI, detects clauses that fail GDPR requirements, and suggests correct wording for each section.          |
| 10  |     Sensitive data classification tool     |          Scans repositories, databases, and documents to classify information by sensitivity level and generate records of processing activities.          |
| 11  |       Cybersecurity audit simulator        |            Generates audit questionnaires adapted to sector and organization size, evaluates responses with AI, and produces a maturity report.            |
| 12  |  Regulatory change monitor with AI alerts  |               Tracks the BOE, OJEU, and regulatory bodies for relevant legal updates, summarizes them with AI, and sends customized alerts.                |
| 13  |     Business continuity plan generator     |            Assists in preparing BCP/DRP, evaluates RPO/RTO, suggests recovery strategies, and generates complete documentation ready for audit.            |
| 14  |       Third-party security analyzer        |                   Assesses suppliers' security posture using questionnaires and external posture scanning, generating a risk scorecard.                    |
| 15  |  Adaptive awareness and training platform  |       Cybersecurity awareness platform that adapts content to employee profiles using AI, measures effectiveness, and reports human maturity level.        |

---

## 5. Mandatory Requirements

### 01 - Web Dashboard

The tool must provide a functional web interface with a dashboard that visually presents relevant information. Being accessible and usable from the internet, not only locally, will be positively valued.

### 02 - Version Control with GitHub

All project code must be hosted in a public or private GitHub repository (accessible to the instructor). The commit history, branch usage, commit messages, and repository organization will be evaluated.

### 03 - Deployment on Hetzner Server

The application must be deployed and accessible on a Hetzner Cloud server (VPS). The group must handle server provisioning, environment setup, and application deployment. The use of containers (Docker) and a custom domain or subdomain will be positively valued.

### 04 - PDF Documentation Report

The project must be accompanied by a professional report in PDF format documenting the entire development process. The report should pay special attention to style, layout, and presentation, and include evidence (screenshots, diagrams, code snippets) from each phase.

The report must include at least:

1. Cover page with project name, team members, and date
2. Table of contents
3. Executive summary (maximum 1 page)
4. Problem description and solution justification
5. Technical architecture with diagram
6. Development process with evidence (phase by phase)
7. Step-by-step deployment guide
8. Tool user manual
9. Conclusions and lessons learned
10. Improvement roadmap (see Requirement 05)

### 05 - Improvement Roadmap for Practice 2

The tool must include a detailed roadmap with planned improvements for Practice 2. This roadmap must be presented visually (phase diagram, milestone table, or similar) and include at least:

1. Planned new functionalities (minimum 5)
2. Performance or scalability improvements
3. Security improvements for the tool itself
4. Integration with other tools or APIs
5. Estimated time and resources for each improvement

---

## 6. Evaluation Criteria

| Criterion                                          | Weight | Points  |
| -------------------------------------------------- | ------ | ------- |
| Functionality and technical quality of the tool    | 30%    | 3 pts   |
| Web dashboard and interface usability              | 15%    | 1.5 pts |
| Correct deployment on Hetzner and accessibility    | 15%    | 1.5 pts |
| GitHub repository quality (commits, structure)     | 10%    | 1 pt    |
| PDF report quality (style, evidence, completeness) | 20%    | 2 pts   |
| Improvement roadmap for Practice 2                 | 10%    | 1 pt    |

---

## 7. Deliverables

Each group must submit the following items by the date indicated by the instructor:

- URL of the tool deployed on Hetzner (accessible and functional at the time of evaluation)
- URL of the GitHub repository containing all code and development commits
- Documentation report in PDF format (submitted on the virtual campus)
- Brief 10-minute oral presentation per group demonstrating the tool live
