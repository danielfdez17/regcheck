# RegCheck Knowledge Net

## Project description

### Submit 1

#### Expected data from companies

- Company type, even though it is not the most important field
- Department type (HHRR, Development, Satelites, Cyber, etc)
- Service to be audited: what they do. Depending on the service, the app generates a form to apply some rules:

> [!example]
>
> - Cyber -> SOC
> - Satellites -> development of photovoltaic panels
> - Web page auditory

- Rules to be applicable (i.e. **_GDPR_**, ISO/IEC 27001)

### Form to be filled depending on what departments/services do

- ¿Software development? -> DevSecOps
- ¿Cloud usage? -> Cloud controls (use hierarchical delegation) or _on premise_ (harder)
- ¿Do they have physics buildings? -> Access control and cameras
- ¿Remote work using VPN? -> ¿Is the VPN secure? ¿Do they have password policies?

### What the app returns

- Clear compliance checklist
- Priority classified
- With concrete actions to solve the issues
- Ask for every rule check the evidence, then the app is also a repository of evidences

---

## Topic

- [[01-sqlite-persistence-goal]]
- [[02-sqlite-schema-and-seeding]]
- [[03-fastapi-db-integration]]
- [[04-validation-and-operations]]
- [[05-frontend-backend-integration]]
- [[06-live-dashboard-and-report-export]]

## Context links

- [[01-sqlite-persistence-goal#scope]]
- [[02-sqlite-schema-and-seeding#data-model]]
- [[03-fastapi-db-integration#request-flow]]
- [[04-validation-and-operations#runbook]]
- [[05-frontend-backend-integration#integration-summary]]
- [[06-live-dashboard-and-report-export#live-preview-behavior]]
- [[06-live-dashboard-and-report-export#report-export-behavior]]
