export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

type PasswordPolicyRule = {
  id: string;
  isSatisfied: (password: string) => boolean;
};

const PASSWORD_POLICY_RULES: PasswordPolicyRule[] = [
  {
    id: "minLength",
    isSatisfied: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "maxLength",
    isSatisfied: (password) => password.length <= PASSWORD_MAX_LENGTH,
  },
  {
    id: "lowercase",
    isSatisfied: (password) => /[a-z]/.test(password),
  },
  {
    id: "uppercase",
    isSatisfied: (password) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    isSatisfied: (password) => /\d/.test(password),
  },
  {
    id: "symbol",
    isSatisfied: (password) => /[^A-Za-z0-9\s]/.test(password),
  },
  {
    id: "noSpaces",
    isSatisfied: (password) => !/\s/.test(password),
  },
];

export function getPasswordPolicyViolations(password: string): string[] {
  return PASSWORD_POLICY_RULES.filter((rule) => !rule.isSatisfied(password)).map(
    (rule) => rule.id,
  );
}
