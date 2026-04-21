"""Seed payloads for GDPR default catalog data."""

from __future__ import annotations

from typing import Final

DEFAULT_DOMAIN_MODE: Final[dict[str, str | bool]] = {
    "id": "gdpr",
    "label": "GDPR",
    "description": "Select the GDPR domain to generate an actionable compliance checklist.",
    "is_default": True,
}

DEFAULT_RULES: Final[list[dict[str, str]]] = [
    {
        "id": "personal_data_processing",
        "domain_mode_id": "gdpr",
        "label": "Personal data processing",
        "description": (
            "You process personal data for customers, leads, employees, or "
            "vendors."
        ),
    },
    {
        "id": "devsecops_secure_sdlc",
        "domain_mode_id": "gdpr",
        "label": "DevSecOps secure SDLC",
        "description": (
            "Software development workflows require secure-by-default "
            "engineering controls."
        ),
    },
    {
        "id": "cloud_security_controls",
        "domain_mode_id": "gdpr",
        "label": "Cloud security controls",
        "description": (
            "Cloud workloads need delegated controls, IAM hardening, and "
            "shared-responsibility evidence."
        ),
    },
    {
        "id": "physical_access_and_video_control",
        "domain_mode_id": "gdpr",
        "label": "Physical access and cameras",
        "description": (
            "Physical offices require controlled access, visitor logs, and "
            "camera policy governance."
        ),
    },
    {
        "id": "remote_work_vpn_and_password_policy",
        "domain_mode_id": "gdpr",
        "label": "Remote work VPN and password policy",
        "description": (
            "Remote access requires secure VPN posture and strong "
            "authentication policies."
        ),
    },
    {
        "id": "security_monitoring_incident_response",
        "domain_mode_id": "gdpr",
        "label": "Security monitoring and incident response",
        "description": (
            "Cyber and SOC services need monitoring coverage and tested "
            "incident response plans."
        ),
    },
    {
        "id": "satellite_systems_and_telemetry_security",
        "domain_mode_id": "gdpr",
        "label": "Satellite and telemetry security",
        "description": (
            "Satellite operations require secure telemetry pipelines and "
            "supply-chain controls."
        ),
    },
    {
        "id": "web_platform_security_and_privacy",
        "domain_mode_id": "gdpr",
        "label": "Website security and privacy",
        "description": (
            "Web and audit services require cookie governance, consent "
            "capture, and secure transport."
        ),
    },
    {
        "id": "employee_data_and_access_governance",
        "domain_mode_id": "gdpr",
        "label": "Employee data and access governance",
        "description": "HR data handling requires restricted access and documented legal basis.",
    },
    {
        "id": "iso_27001_control_baseline",
        "domain_mode_id": "gdpr",
        "label": "ISO/IEC 27001 control baseline",
        "description": (
            "Prepare a minimum security management baseline aligned with "
            "ISO/IEC 27001 controls."
        ),
    },
]

DEFAULT_CHECKLIST_ITEMS: Final[list[dict[str, str]]] = [
    {
        "id": "document-processing-activities",
        "rule_id": "personal_data_processing",
        "title": "Document processing activities",
        "description": (
            "Keep a record of what personal data you collect, why you collect it, "
            "and where you store it."
        ),
        "priority": "high",
    },
    {
        "id": "publish-privacy-policy",
        "rule_id": "personal_data_processing",
        "title": "Publish a privacy policy",
        "description": (
            "Explain the legal basis, retention policy, and rights available "
            "to data subjects."
        ),
        "priority": "high",
    },
    {
        "id": "track-retention-periods",
        "rule_id": "personal_data_processing",
        "title": "Track retention periods",
        "description": (
            "Define how long each category of personal data is kept and when "
            "it must be deleted."
        ),
        "priority": "medium",
    },
    {
        "id": "define-dsr-process",
        "rule_id": "personal_data_processing",
        "title": "Define a data subject request process",
        "description": (
            "Create a process to handle access, rectification, deletion, "
            "and portability requests."
        ),
        "priority": "high",
    },
    {
        "id": "assign-privacy-owner",
        "rule_id": "personal_data_processing",
        "title": "Assign a privacy owner",
        "description": (
            "Ensure a named owner is accountable for GDPR governance "
            "and follow-up actions."
        ),
        "priority": "medium",
    },
    {
        "id": "devsecops-threat-modeling",
        "rule_id": "devsecops_secure_sdlc",
        "title": "Integrate threat modeling in delivery",
        "description": "Run threat modeling before major releases and document mitigations.",
        "priority": "high",
    },
    {
        "id": "devsecops-pipeline-security",
        "rule_id": "devsecops_secure_sdlc",
        "title": "Enforce CI security gates",
        "description": "Block deployments when SAST, dependency, or secret scanning fails.",
        "priority": "high",
    },
    {
        "id": "cloud-iam-hardening",
        "rule_id": "cloud_security_controls",
        "title": "Harden cloud identities and roles",
        "description": "Apply least privilege and periodic access reviews for cloud identities.",
        "priority": "high",
    },
    {
        "id": "cloud-shared-responsibility",
        "rule_id": "cloud_security_controls",
        "title": "Document shared responsibility",
        "description": "Map provider and company responsibilities for each control domain.",
        "priority": "medium",
    },
    {
        "id": "physical-badge-governance",
        "rule_id": "physical_access_and_video_control",
        "title": "Control badge and visitor access",
        "description": "Use approved badge workflows and audited visitor entries.",
        "priority": "high",
    },
    {
        "id": "camera-retention-policy",
        "rule_id": "physical_access_and_video_control",
        "title": "Define CCTV retention policy",
        "description": "Set legal basis, retention windows, and restricted review procedures.",
        "priority": "medium",
    },
    {
        "id": "vpn-hardening",
        "rule_id": "remote_work_vpn_and_password_policy",
        "title": "Harden VPN configuration",
        "description": "Require MFA, secure protocols, and periodic VPN configuration checks.",
        "priority": "high",
    },
    {
        "id": "password-policy-enforcement",
        "rule_id": "remote_work_vpn_and_password_policy",
        "title": "Enforce password policy",
        "description": "Define complexity, reuse, and lockout controls with technical enforcement.",
        "priority": "medium",
    },
    {
        "id": "soc-log-coverage",
        "rule_id": "security_monitoring_incident_response",
        "title": "Ensure SOC log coverage",
        "description": "Cover critical systems with monitored logs and alert tuning.",
        "priority": "high",
    },
    {
        "id": "incident-response-tests",
        "rule_id": "security_monitoring_incident_response",
        "title": "Run incident response exercises",
        "description": "Test response playbooks and track remediation outcomes.",
        "priority": "high",
    },
    {
        "id": "satellite-telemetry-encryption",
        "rule_id": "satellite_systems_and_telemetry_security",
        "title": "Encrypt telemetry pipelines",
        "description": "Protect telemetry data in transit and at rest with managed keys.",
        "priority": "high",
    },
    {
        "id": "satellite-supplier-assurance",
        "rule_id": "satellite_systems_and_telemetry_security",
        "title": "Assess supplier security posture",
        "description": "Review satellite and hardware suppliers against security requirements.",
        "priority": "medium",
    },
    {
        "id": "web-consent-management",
        "rule_id": "web_platform_security_and_privacy",
        "title": "Implement consent management",
        "description": "Capture and store consent decisions with auditable timestamps.",
        "priority": "high",
    },
    {
        "id": "web-tls-and-security-headers",
        "rule_id": "web_platform_security_and_privacy",
        "title": "Enforce TLS and security headers",
        "description": "Enable modern TLS and baseline browser security headers.",
        "priority": "medium",
    },
    {
        "id": "hr-access-minimization",
        "rule_id": "employee_data_and_access_governance",
        "title": "Minimize HR data access",
        "description": "Limit employee data access to approved HR and legal roles.",
        "priority": "high",
    },
    {
        "id": "hr-legal-basis-catalog",
        "rule_id": "employee_data_and_access_governance",
        "title": "Catalog HR legal basis",
        "description": "Map each HR processing purpose to a valid legal basis.",
        "priority": "medium",
    },
    {
        "id": "iso-risk-register",
        "rule_id": "iso_27001_control_baseline",
        "title": "Maintain an information security risk register",
        "description": "Track risks, treatment decisions, and residual risk acceptance.",
        "priority": "high",
    },
    {
        "id": "iso-statement-of-applicability",
        "rule_id": "iso_27001_control_baseline",
        "title": "Prepare statement of applicability",
        "description": "Document applicable Annex A controls and implementation status.",
        "priority": "medium",
    },
]
