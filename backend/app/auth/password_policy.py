"""Password policy enforcement for account creation."""

from __future__ import annotations

import re

MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_LENGTH = 128
PASSWORD_POLICY_DESCRIPTION = (
    "Password must be 12-128 characters and include uppercase, lowercase, "
    "number, and symbol characters with no spaces."
)

_LOWERCASE_PATTERN = re.compile(r"[a-z]")
_UPPERCASE_PATTERN = re.compile(r"[A-Z]")
_DIGIT_PATTERN = re.compile(r"\d")
_SYMBOL_PATTERN = re.compile(r"[^A-Za-z0-9\s]")
_WHITESPACE_PATTERN = re.compile(r"\s")


def get_password_policy_violations(password: str) -> list[str]:
    """Return the password policy requirements not satisfied by a password."""

    violations: list[str] = []
    if len(password) < MIN_PASSWORD_LENGTH:
        violations.append("be at least 12 characters long")
    if len(password) > MAX_PASSWORD_LENGTH:
        violations.append("be no more than 128 characters long")
    if _LOWERCASE_PATTERN.search(password) is None:
        violations.append("include a lowercase letter")
    if _UPPERCASE_PATTERN.search(password) is None:
        violations.append("include an uppercase letter")
    if _DIGIT_PATTERN.search(password) is None:
        violations.append("include a number")
    if _SYMBOL_PATTERN.search(password) is None:
        violations.append("include a symbol")
    if _WHITESPACE_PATTERN.search(password) is not None:
        violations.append("not contain spaces")
    return violations


def validate_password_policy(password: str) -> str:
    """Validate a password and raise ValueError when it is too weak."""

    violations = get_password_policy_violations(password)
    if violations:
        raise ValueError(PASSWORD_POLICY_DESCRIPTION)
    return password
