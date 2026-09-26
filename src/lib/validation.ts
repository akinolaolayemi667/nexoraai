const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export const passwordRules = [
  { id: "length", label: "8+ characters", required: true, test: (v: string) => v.length >= 8 },
  { id: "case", label: "Upper & lowercase", required: true, test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: "number", label: "A number", required: true, test: (v: string) => /\d/.test(v) },
  { id: "symbol", label: "A symbol", required: false, test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export function passwordStrength(value: string) {
  const score = passwordRules.filter((rule) => rule.test(value)).length;
  const meetsRequirements = passwordRules.every((rule) => !rule.required || rule.test(value));
  return { score, meetsRequirements };
}
