// lib/auth-helpers-utils.ts
// ⬅️ بدون "use server"

export type Scope = {
  schoolId: number;
  academicYearId: number;
  role: string;
  userId: string;
  username: string;
  isManager: boolean;
  isDeputy: boolean;
  permissions: string[];
};

export type ScopeError = { error: string };

export function isScopeError(scope: Scope | ScopeError): scope is ScopeError {
  return "error" in scope;
}
