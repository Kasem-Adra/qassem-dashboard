import { jsonError, requireAdmin, type ApiHandler } from "./api"

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

function runtimeRoleFromRequest(request: Request): RuntimeRole {
  const role = request.headers.get("x-abos-role")
  return role === "operator" ? "operator" : "admin"
}

export function requireRuntimeScope(request: Request, scope: RuntimeScope) {
  const unauthorized = requireAdmin(request)
  if (unauthorized) return unauthorized

  const role = runtimeRoleFromRequest(request)
  if (!roleScopes[role].includes(scope)) {
    return jsonError(`Missing runtime scope: ${scope}`, 403)
  }

  return null
}

export function withRuntimeScope(scope: RuntimeScope, handler: ApiHandler): ApiHandler {
  return (request) => {
    const denied = requireRuntimeScope(request, scope)
    if (denied) return denied
    return handler(request)
  }
}

export function runtimeRoleCatalog() {
  return Object.entries(roleScopes).map(([name, scopes]) => ({ name, scopes }))
}
