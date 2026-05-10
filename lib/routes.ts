type Role = "client" | "provider"

const CLIENT_HOME = "/client/discussion"
const PROVIDER_HOME = "/provider/discussion"

function routeForRole(role: Role | undefined | null): string {
  return role === "provider" ? PROVIDER_HOME : CLIENT_HOME
}

function isRole(value: unknown): value is Role {
  return value === "client" || value === "provider"
}

export { routeForRole, isRole, CLIENT_HOME, PROVIDER_HOME }
export type { Role }
