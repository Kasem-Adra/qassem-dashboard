import { authenticateRequest, jsonError, type ApiHandler, type AuthenticatedPrincipal } from "./api"

export type RuntimeRole = "admin" | "operator"

export type RuntimeScope =
  | "runtime:read"
  | "runtime:tasks:write"
  | "runtime:tasks:control"
  | "runtime:workflows:write"
  | "runtime:tools:write"
  | "runtime:agents:write"
  | "runtime:hooks:write"
  | "runtime:roles:write"

const roleScopes: Record<RuntimeRole, RuntimeScope[]> = {
  admin: [
    "runtime:read",
    "runtime:tasks:write",
    "runtime:tasks:control",
    "runtime:workflows:write",
    "runtime:tools:write",
    "runtime:agents:write",
    "runtime:hooks:write",
    "runtime:roles:write",
  ],
  operator: ["runtime:read", "runtime:tasks:control"],
}

function runtimeRoleFromPrincipal(principal: AuthenticatedPrincipal): RuntimeRole {
  return principal.role === "operator" ? "operator" : "admin"
}

export async function requireRuntimeScope(request: Request, scope: RuntimeScope) {
  const principal = await authenticateRequest(request)
  if (principal instanceof Response) return principal

  const role = runtimeRoleFromPrincipal(principal)
  if (!roleScopes[role].includes(scope)) {
    return jsonError(`Missing runtime scope: ${scope}`, 403)
  }

  return null
}

export function withRuntimeScope(scope: RuntimeScope, handler: ApiHandler): ApiHandler {
  return async (request) => {
    const denied = await requireRuntimeScope(request, scope)
    if (denied) return denied
    return handler(request)
  }
}

export function runtimeRoleCatalog() {
  return Object.entries(roleScopes).map(([name, scopes]) => ({ name, scopes }))
}
